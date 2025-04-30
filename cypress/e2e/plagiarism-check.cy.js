describe('Plagiarism Check', () => {
  beforeEach(() => {
    // Intercept các API calls để theo dõi nhưng không mock response
    cy.intercept('GET', '**/get_all_pdf_contents').as('getAllDocuments')
    cy.intercept('POST', '**/auto-layered-detection-by-names').as('checkDocumentsByNames')
    cy.intercept('GET', '**/auto-layered-detection-debug').as('checkAllDocuments')

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

    // Đợi API lấy dữ liệu tài liệu được gọi
    cy.wait('@getAllDocuments')

    // Lưu các tài liệu vào biến để sử dụng sau
    cy.get('.bg-white.rounded-lg.shadow-md')
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
  })

  it('should display queued documents from API data', () => {
    // Lấy dữ liệu từ API và lưu vào localStorage
    cy.visit('/documents')
    cy.wait('@getAllDocuments').then((interception) => {
      // Đảm bảo response có dữ liệu
      expect(interception.response.body).to.exist

      // Lấy tối đa 2 tài liệu từ phản hồi API
      const apiDocuments = interception.response.body.slice(0, 2)

      // Lưu tài liệu vào localStorage
      cy.window().then((win) => {
        win.localStorage.setItem('plagiarismCheckQueue', JSON.stringify(apiDocuments))

        // Chuyển đến trang kiểm tra đạo văn
        cy.visit('/plagiarism-check')

        // Kiểm tra hiển thị của tài liệu trong queue
        cy.contains(`Tài liệu trong hàng đợi (${apiDocuments.length})`).should('be.visible')

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
    cy.wait('@getAllDocuments').then((interception) => {
      // Đảm bảo response có đủ dữ liệu
      expect(interception.response.body).to.exist

      // Cần ít nhất 2 tài liệu để kiểm tra xóa
      if (interception.response.body.length >= 2) {
        // Lấy 2 tài liệu đầu tiên từ API
        const apiDocuments = interception.response.body.slice(0, 2)

        // Lưu tài liệu vào localStorage
        cy.window().then((win) => {
          win.localStorage.setItem('plagiarismCheckQueue', JSON.stringify(apiDocuments))

          // Chuyển đến trang kiểm tra đạo văn
          cy.visit('/plagiarism-check')

          // Xác nhận có đúng số lượng tài liệu ban đầu
          cy.contains(`Tài liệu trong hàng đợi (${apiDocuments.length})`).should('be.visible')

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
      } else {
        // Bỏ qua test nếu không đủ dữ liệu
        cy.log('Cần ít nhất 2 tài liệu trong hệ thống để kiểm tra chức năng xóa')
      }
    })
  })

  it('should clear all documents from queue using real document data', () => {
    // Lấy dữ liệu từ API và lưu vào localStorage
    cy.visit('/documents')
    cy.wait('@getAllDocuments').then((interception) => {
      // Đảm bảo response có dữ liệu
      expect(interception.response.body).to.exist

      // Lấy tối đa 2 tài liệu từ phản hồi API
      const apiDocuments = interception.response.body.slice(0, 2)

      if (apiDocuments.length > 0) {
        // Lưu tài liệu vào localStorage
        cy.window().then((win) => {
          win.localStorage.setItem('plagiarismCheckQueue', JSON.stringify(apiDocuments))

          // Chuyển đến trang kiểm tra đạo văn
          cy.visit('/plagiarism-check')

          // Click nút xóa hàng đợi
          cy.contains('Xóa hàng đợi').click()

          // Kiểm tra thông báo khi queue trống xuất hiện
          cy.contains('Chưa có tài liệu nào trong hàng đợi').should('be.visible')

          // Kiểm tra localStorage đã được xóa
          cy.window().then((win) => {
            expect(win.localStorage.getItem('plagiarismCheckQueue')).to.be.null
          })
        })
      } else {
        cy.log('Không có tài liệu nào trong hệ thống để kiểm tra chức năng xóa tất cả')
      }
    })
  })

  it('should start plagiarism check for queued documents using real data', () => {
    // Lấy dữ liệu từ API và lưu vào localStorage
    cy.visit('/documents')
    cy.wait('@getAllDocuments').then((interception) => {
      // Đảm bảo response có dữ liệu
      expect(interception.response.body).to.exist

      // Lấy tối đa 2 tài liệu từ phản hồi API
      const apiDocuments = interception.response.body.slice(0, 2)

      if (apiDocuments.length > 0) {
        // Lưu tài liệu vào localStorage
        cy.window().then((win) => {
          win.localStorage.setItem('plagiarismCheckQueue', JSON.stringify(apiDocuments))

          // Chuyển đến trang kiểm tra đạo văn
          cy.visit('/plagiarism-check')

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

            // Đợi API được gọi và hoàn thành
            cy.wait('@checkDocumentsByNames').its('response.statusCode').should('eq', 200)

            // Đợi cho đến khi hoàn thành
            cy.contains('HOÀN THÀNH PHÂN TÍCH ĐẠO VĂN', { timeout: 2000 }).should('be.visible')
            cy.contains('Đi đến trang xem kết quả').should('be.visible')
          })
        })
      } else {
        cy.log('Không có tài liệu nào trong hệ thống để kiểm tra chức năng phân tích đạo văn')
      }
    })
  })

  //   it('should display progress bar correctly', () => {
  //     // Lấy dữ liệu từ API và lưu vào localStorage
  //     cy.visit('/documents')
  //     cy.wait('@getAllDocuments').then((interception) => {
  //       // Đảm bảo response có dữ liệu
  //       expect(interception.response.body).to.exist

  //       // Lấy tối đa 2 tài liệu từ phản hồi API
  //       const apiDocuments = interception.response.body.slice(0, 2)

  //       if (apiDocuments.length > 0) {
  //         // Lưu tài liệu vào localStorage
  //         cy.window().then((win) => {
  //           win.localStorage.setItem('plagiarismCheckQueue', JSON.stringify(apiDocuments))

  //           // Chuyển đến trang kiểm tra đạo văn
  //           cy.visit('/plagiarism-check')

  //           // Mô phỏng gửi các tin nhắn WebSocket
  //           cy.window().then((win) => {
  //             const originalWebSocket = win.WebSocket
  //             win.WebSocket = class MockProgressWebSocket extends originalWebSocket {
  //               constructor(url) {
  //                 super(url)

  //                 // Gửi thông báo tiến trình
  //                 setTimeout(() => {
  //                   this.onmessage({ data: 'BẮT ĐẦU PHÂN TÍCH ĐẠO VĂN' })
  //                   setTimeout(() => this.onmessage({ data: 'Layer 1: Bắt đầu' }), 100)
  //                   setTimeout(() => this.onmessage({ data: 'Layer 1: Đang xử lý (50%)' }), 300)
  //                 }, 100)
  //               }
  //             }

  //             // Click nút kiểm tra tài liệu đã chọn
  //             cy.contains('Kiểm tra tài liệu đã chọn').click()

  //             // Kiểm tra thanh tiến trình xuất hiện
  //             cy.get('.bg-indigo-600').should('exist')

  //             // Kiểm tra các thông báo được hiển thị đúng
  //             cy.contains('BẮT ĐẦU PHÂN TÍCH ĐẠO VĂN').should('be.visible')
  //             cy.contains('Layer 1: Bắt đầu').should('be.visible')
  //             cy.contains('Layer 1: Đang xử lý (50%)').should('be.visible')

  //             // Kiểm tra giá trị thanh tiến trình
  //             cy.get('.bg-indigo-600').should('have.attr', 'style').and('include', 'width:')
  //           })
  //         })
  //       } else {
  //         cy.log('Không có tài liệu nào trong hệ thống để kiểm tra thanh tiến trình')
  //       }
  //     })
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
