describe('Plagiarism Check', () => {
  beforeEach(() => {
    // Intercept các API calls để theo dõi nhưng không mock response
    cy.intercept('GET', '**/get_all_pdf_contents').as('getAllDocuments')
    cy.intercept('POST', '**/auto-layered-detection-by-names').as('checkDocumentsByNames')
    cy.intercept('GET', '**/auto-layered-detection-debug').as('checkAllDocuments')
    cy.intercept('GET', '**/api/ngrok-url').as('getNgrokUrl')

    // Đặt viewport để phù hợp với tất cả các thiết bị
    cy.viewport(1280, 720)

    // Giả lập WebSocket connection
    cy.window().then((win) => {
      win.WebSocket = class MockWebSocket {
        constructor(url) {
          this.url = url
          this.readyState = WebSocket.OPEN
          this.onopen = null
          this.onclose = null
          setTimeout(() => {
            if (this.onopen) this.onopen()
          }, 50)
        }
        send(data) {
          console.log('WebSocket message sent:', data)
        }
        close() {
          if (this.onclose) this.onclose({ code: 1000, reason: 'Test closed' })
        }
      }

      // Simulate WebSocket.OPEN value
      win.WebSocket.OPEN = 1
    })

    // Truy cập trang kiểm tra đạo văn
    cy.visit('/plagiarism-check')
  })

  it('should display empty queue notification when no documents are queued', () => {
    // Xóa dữ liệu localStorage để đảm bảo queue trống
    cy.clearLocalStorage('plagiarismCheckQueue')
    cy.reload()

    // Kiểm tra thông báo khi queue trống
    cy.contains('Chưa có tài liệu nào trong hàng đợi').should('be.visible')
    cy.contains('Đi đến trang Tài liệu').should('be.visible')
  })

  it('should navigate to documents page when clicking on the link', () => {
    // Xóa dữ liệu localStorage để đảm bảo queue trống
    cy.clearLocalStorage('plagiarismCheckQueue')
    cy.reload()

    // Click vào link đi đến trang Tài liệu
    cy.contains('Đi đến trang Tài liệu').click()

    // Kiểm tra url đã chuyển sang trang tài liệu
    cy.url().should('include', '/documents')
  })

  it('should fetch documents from API and select them for plagiarism check', () => {
    // Chuyển đến trang tài liệu để lấy dữ liệu thật từ API
    cy.visit('/documents')

    // Wait for API call with increased timeout
    cy.wait('@getAllDocuments', { timeout: 20000 }).then((interception) => {
      // Verify we have a valid response
      expect(interception.response.statusCode).to.be.oneOf([200, 304])
      expect(interception.response.body).to.exist

      // Check if we have documents to test with
      if (interception.response.body && interception.response.body.length > 0) {
        // Now try to select documents with retry if needed
        cy.get('.bg-white.rounded-lg.shadow-md', { timeout: 10000 })
          .should('have.length.at.least', 1)
          .then(($docs) => {
            // Chọn tối đa 2 tài liệu
            const docsToSelect = Math.min($docs.length, 2)

            // Chọn các tài liệu bằng cách click vào checkbox
            for (let i = 0; i < docsToSelect; i++) {
              cy.wrap($docs[i]).find('input[type="checkbox"]').click({ force: true })
            }

            // Kiểm tra nút "Thêm vào kiểm tra đạo văn" đã hiển thị
            cy.contains('Thêm').should('be.visible')

            // Click vào nút để thêm vào kiểm tra đạo văn
            cy.contains('Thêm').click()

            // Kiểm tra đã chuyển hướng đến trang kiểm tra đạo văn
            cy.url().should('include', '/plagiarism-check')
          })
      } else {
        // Skip test if no documents are available
        cy.log('No documents available in the system. Skipping this test.')
        this.skip()
      }
    })
  })

  it('should display queued documents from API data', () => {
    // Lấy dữ liệu từ API và lưu vào localStorage
    cy.visit('/documents')
    cy.wait('@getAllDocuments', { timeout: 20000 }).then((interception) => {
      // Check if we have a valid response
      expect(interception.response.statusCode).to.be.oneOf([200, 304])

      // Check if we have some documents to work with
      if (!interception.response.body || interception.response.body.length === 0) {
        cy.log('No documents available in the system. Skipping this test.')
        this.skip()
        return
      }

      // Lấy tối đa 2 tài liệu từ phản hồi API
      const apiDocuments = interception.response.body.slice(0, 2)

      // Lưu tài liệu vào localStorage
      cy.window().then((win) => {
        win.localStorage.setItem('plagiarismCheckQueue', JSON.stringify(apiDocuments))

        // Chuyển đến trang kiểm tra đạo văn
        cy.visit('/plagiarism-check')

        // Kiểm tra hiển thị của tài liệu trong queue
        cy.contains(`Tài liệu trong hàng đợi (${apiDocuments.length})`, { timeout: 5000 }).should(
          'be.visible',
        )

        // Kiểm tra tài liệu đầu tiên hiển thị
        if (apiDocuments.length > 0) {
          cy.contains(apiDocuments[0].filename).should('be.visible')
        }

        // Kiểm tra tài liệu thứ hai hiển thị (nếu có)
        if (apiDocuments.length > 1) {
          cy.contains(apiDocuments[1].filename).should('be.visible')
        }
      })
    })
  })

  it('should remove document from queue using real document data', () => {
    // Lấy dữ liệu từ API và lưu vào localStorage
    cy.visit('/documents')
    cy.wait('@getAllDocuments', { timeout: 20000 }).then((interception) => {
      // Check if we have a valid response
      expect(interception.response.statusCode).to.be.oneOf([200, 304])

      // Check if we have at least 2 documents
      if (!interception.response.body || interception.response.body.length < 2) {
        cy.log('Need at least 2 documents in the system to test removal. Skipping this test.')
        this.skip()
        return
      }

      // Lấy 2 tài liệu đầu tiên từ API
      const apiDocuments = interception.response.body.slice(0, 2)

      // Lưu tài liệu vào localStorage
      cy.window().then((win) => {
        win.localStorage.setItem('plagiarismCheckQueue', JSON.stringify(apiDocuments))

        // Chuyển đến trang kiểm tra đạo văn
        cy.visit('/plagiarism-check')

        // Xác nhận có đúng số lượng tài liệu ban đầu
        cy.contains(`Tài liệu trong hàng đợi (${apiDocuments.length})`, { timeout: 5000 }).should(
          'be.visible',
        )

        // Click nút xóa cho tài liệu đầu tiên
        cy.contains('tr', apiDocuments[0].filename).within(() => {
          cy.contains('Xóa').click()
        })

        // Kiểm tra còn 1 tài liệu trong queue
        cy.contains('Tài liệu trong hàng đợi (1)').should('be.visible')
        cy.contains(apiDocuments[1].filename).should('be.visible')
        cy.contains(apiDocuments[0].filename).should('not.exist')

        // Kiểm tra localStorage cũng đã được cập nhật
        cy.window().then((win) => {
          const updatedQueue = JSON.parse(win.localStorage.getItem('plagiarismCheckQueue'))
          expect(updatedQueue.length).to.equal(1)
          expect(updatedQueue[0].filename).to.equal(apiDocuments[1].filename)
        })
      })
    })
  })

  it('should clear all documents from queue using real document data', () => {
    // Lấy dữ liệu từ API và lưu vào localStorage
    cy.visit('/documents')
    cy.wait('@getAllDocuments', { timeout: 20000 }).then((interception) => {
      // Check if we have a valid response
      expect(interception.response.statusCode).to.be.oneOf([200, 304])

      // Check if we have some documents to work with
      if (!interception.response.body || interception.response.body.length === 0) {
        cy.log('No documents available in the system. Skipping this test.')
        this.skip()
        return
      }

      // Lấy tối đa 2 tài liệu từ phản hồi API
      const apiDocuments = interception.response.body.slice(0, 2)

      // Lưu tài liệu vào localStorage
      cy.window().then((win) => {
        win.localStorage.setItem('plagiarismCheckQueue', JSON.stringify(apiDocuments))

        // Chuyển đến trang kiểm tra đạo văn
        cy.visit('/plagiarism-check')

        // Đợi UI hiển thị hàng đợi
        cy.contains(`Tài liệu trong hàng đợi`, { timeout: 5000 }).should('be.visible')

        // Click nút xóa hàng đợi
        cy.contains('Xóa hàng đợi').click()

        // Kiểm tra thông báo khi queue trống xuất hiện
        cy.contains('Chưa có tài liệu nào trong hàng đợi').should('be.visible')

        // Kiểm tra localStorage đã được xóa
        cy.window().then((win) => {
          expect(win.localStorage.getItem('plagiarismCheckQueue')).to.be.null
        })
      })
    })
  })

  it('should start plagiarism check for queued documents using real data', () => {
    // Lấy dữ liệu từ API và lưu vào localStorage
    cy.visit('/documents')
    cy.wait('@getAllDocuments', { timeout: 20000 }).then((interception) => {
      // Check if we have a valid response
      expect(interception.response.statusCode).to.be.oneOf([200, 304])

      // Check if we have some documents to work with
      if (!interception.response.body || interception.response.body.length === 0) {
        cy.log('No documents available in the system. Skipping this test.')
        this.skip()
        return
      }

      // Lấy tối đa 2 tài liệu từ phản hồi API
      const apiDocuments = interception.response.body.slice(0, 2)

      // Lưu tài liệu vào localStorage
      cy.window().then((win) => {
        win.localStorage.setItem('plagiarismCheckQueue', JSON.stringify(apiDocuments))

        // Chuyển đến trang kiểm tra đạo văn
        cy.visit('/plagiarism-check')

        // Đợi UI hiển thị hàng đợi
        cy.contains(`Tài liệu trong hàng đợi`, { timeout: 5000 }).should('be.visible')

        // Mô phỏng gửi các tin nhắn WebSocket khi nút kiểm tra được nhấn
        cy.window().then((win) => {
          const originalWebSocket = win.WebSocket
          win.WebSocket = class MockProgressWebSocket extends originalWebSocket {
            constructor(url) {
              super(url)

              // Schedule progress messages
              setTimeout(() => {
                this.onmessage({ data: 'BẮT ĐẦU PHÂN TÍCH ĐẠO VĂN' })
                setTimeout(() => this.onmessage({ data: 'Layer 1: Bắt đầu' }), 100)
                setTimeout(() => this.onmessage({ data: 'Layer 1: Đang xử lý (25%)' }), 200)
                setTimeout(() => this.onmessage({ data: 'Layer 1: Đang xử lý (50%)' }), 300)
                setTimeout(() => this.onmessage({ data: 'Layer 1: Đang xử lý (75%)' }), 400)
                setTimeout(() => this.onmessage({ data: 'Layer 1: Hoàn thành' }), 500)
                setTimeout(() => this.onmessage({ data: 'Layer 2: Bắt đầu' }), 600)
                setTimeout(() => this.onmessage({ data: 'Layer 2: Đang xử lý (50%)' }), 700)
                setTimeout(() => this.onmessage({ data: 'Layer 2: Hoàn thành' }), 800)
                setTimeout(() => this.onmessage({ data: 'Layer 3: Bắt đầu' }), 900)
                setTimeout(() => this.onmessage({ data: 'Layer 3: Đang xử lý (50%)' }), 1000)
                setTimeout(() => this.onmessage({ data: 'Layer 3: Hoàn thành' }), 1100)
                setTimeout(() => this.onmessage({ data: 'HOÀN THÀNH PHÂN TÍCH ĐẠO VĂN' }), 1200)
              }, 100)
            }
          }

          // Click nút kiểm tra
          cy.contains('Kiểm tra tài liệu đã chọn').click()

          // Kiểm tra hiển thị trạng thái đang xử lý
          cy.contains('Đang xử lý...').should('be.visible')

          // Kiểm tra các thông báo tiến trình
          cy.contains('BẮT ĐẦU PHÂN TÍCH ĐẠO VĂN').should('be.visible')
          cy.contains('Layer 1: Bắt đầu').should('be.visible')

          // Intercept API call - with possibility that it might fail in test environment
          cy.intercept('POST', '**/auto-layered-detection-by-names').as('checkDocumentsByNames')

          // Wait for API call with longer timeout and handle potential failure gracefully
          cy.wait('@checkDocumentsByNames', { timeout: 30000 }).then((interception) => {
            // Just verify the request was made - API might be simulated
            expect(interception.request.body).to.exist

            // Continue with WebSocket success flow regardless
            cy.contains('HOÀN THÀNH PHÂN TÍCH ĐẠO VĂN', { timeout: 10000 }).should('exist')
            // Check for results button which should be more reliably visible
            cy.contains('Đi đến trang xem kết quả', { timeout: 10000 }).should('be.visible')
          })
        })
      })
    })
  })

  // Commented test case kept for reference
  //   it('should display progress bar correctly', () => {
  //     // ...
  //   })

  it('should navigate to results page when result button is clicked', () => {
    cy.reload()

    // Mô phỏng hoàn thành kiểm tra bằng cách thiết lập trạng thái
    cy.window().then((win) => {
      const progressMessages = ['BẮT ĐẦU PHÂN TÍCH ĐẠO VĂN', 'HOÀN THÀNH PHÂN TÍCH ĐẠO VĂN']
      win.localStorage.setItem('plagiarismProgressMessages', JSON.stringify(progressMessages))
    })

    cy.reload()

    // Kiểm tra nút đi đến kết quả
    cy.contains('Đi đến trang xem kết quả').should('be.visible').click()

    // Kiểm tra đã chuyển hướng đến trang kết quả
    cy.url().should('include', '/view-results')
  })
})
