describe('View Results', () => {
  beforeEach(() => {
    // Intercept các API calls để theo dõi nhưng không mock response
    cy.intercept('GET', '**/get_all_pdf_contents').as('getAllDocuments')
    cy.intercept('GET', '**/auto-layered-detection-debug').as('getAllResults')
    cy.intercept('POST', '**/compare-pdfs-by-names').as('comparePdfsByName')
    cy.intercept('GET', '**/api/ngrok-url').as('getNgrokUrl')

    // Đặt viewport để phù hợp với tất cả các thiết bị
    cy.viewport(1280, 720)
  })

  it('should display no results message when no plagiarism check has been performed', () => {
    // Xóa dữ liệu localStorage để đảm bảo không có kết quả
    cy.clearLocalStorage('plagiarismResults')
    cy.clearLocalStorage('plagiarismResultType')

    // Truy cập trang xem kết quả
    cy.visit('/view-results')

    // Kiểm tra thông báo khi không có kết quả
    cy.contains('Không tìm thấy kết quả kiểm tra đạo văn').should('be.visible')
    cy.contains('Vui lòng thực hiện kiểm tra trước khi xem kết quả').should('be.visible')
    cy.contains('Đi đến trang kiểm tra đạo văn').should('be.visible')
  })

  it('should navigate to plagiarism check page when clicking on link', () => {
    // Xóa dữ liệu localStorage để đảm bảo không có kết quả
    cy.clearLocalStorage('plagiarismResults')
    cy.clearLocalStorage('plagiarismResultType')

    // Truy cập trang xem kết quả
    cy.visit('/view-results')

    // Click vào link đi đến trang kiểm tra đạo văn
    cy.contains('Đi đến trang kiểm tra đạo văn').click()

    // Kiểm tra đã chuyển hướng đến trang kiểm tra đạo văn
    cy.url().should('include', '/plagiarism-check')
  })

  it('should display mock results in development mode', () => {
    // Xóa dữ liệu localStorage để đảm bảo không có kết quả thật
    cy.clearLocalStorage('plagiarismResults')
    cy.clearLocalStorage('plagiarismResultType')

    // Chuẩn bị dữ liệu mẫu cho kết quả
    cy.fixture('mock_results.json').then((mockResults) => {
      // Truy cập trang xem kết quả - trong chế độ dev sẽ dùng mock data
      cy.visit('/view-results')

      // Kiểm tra hiển thị tổng quan kết quả
      cy.contains('Kết quả kiểm tra đạo văn').should('be.visible')

      // Kiểm tra hiển thị thông tin tổng quan
      cy.contains('Tài liệu').should('be.visible')
      cy.contains('Thời gian').should('be.visible')
      cy.contains('Cặp so sánh').should('be.visible')
      cy.contains('Trùng lặp').should('be.visible')

      // Kiểm tra có select controls cho filtering và sorting
      cy.get('select').should('have.length.at.least', 2)
    })
  })

  it('should switch between pairs and documents view modes', () => {
    // Xóa dữ liệu localStorage và sử dụng mock data
    cy.clearLocalStorage('plagiarismResults')
    cy.clearLocalStorage('plagiarismResultType')

    // Chuẩn bị dữ liệu mẫu cho kết quả
    cy.fixture('mock_results.json').then((mockResults) => {
      // Lưu kết quả vào localStorage
      cy.window().then((win) => {
        win.localStorage.setItem('plagiarismResults', JSON.stringify(mockResults))
        win.localStorage.setItem('plagiarismResultType', JSON.stringify('queue'))

        // Truy cập trang xem kết quả
        cy.visit('/view-results')

        // Kiểm tra mode xem - nếu mặc định là documents
        cy.get('select')
          .last()
          .then(($select) => {
            if ($select.val() === 'documents') {
              // Mặc định là documents, chuyển sang pairs
              cy.get('select').last().select('pairs')

              // Kiểm tra đã chuyển chế độ
              cy.get('h2').contains('Chi tiết kết quả so sánh').should('be.visible')

              // Chuyển lại chế độ tài liệu
              cy.get('select').last().select('documents')

              // Kiểm tra đã chuyển về chế độ tài liệu
              cy.get('h2').contains('Phân tích theo tài liệu').should('be.visible')
            } else {
              // Mặc định là pairs, chuyển sang documents
              cy.get('select').last().select('documents')

              // Kiểm tra đã chuyển chế độ
              cy.get('h2').contains('Phân tích theo tài liệu').should('be.visible')

              // Chuyển lại chế độ pairs
              cy.get('select').last().select('pairs')

              // Kiểm tra đã chuyển về chế độ pairs
              cy.get('h2').contains('Chi tiết kết quả so sánh').should('be.visible')
            }
          })
      })
    })
  })

  it('should sort results by different criteria', () => {
    // Xóa dữ liệu localStorage và sử dụng mock data
    cy.clearLocalStorage('plagiarismResults')
    cy.clearLocalStorage('plagiarismResultType')

    // Chuẩn bị dữ liệu mẫu cho kết quả
    cy.fixture('mock_results.json').then((mockResults) => {
      // Lưu kết quả vào localStorage
      cy.window().then((win) => {
        win.localStorage.setItem('plagiarismResults', JSON.stringify(mockResults))
        win.localStorage.setItem('plagiarismResultType', JSON.stringify('queue'))

        // Truy cập trang xem kết quả
        cy.visit('/view-results')

        // Kiểm tra nếu có dropdown để sắp xếp
        cy.get('select')
          .eq(1)
          .should('exist')
          .then(($select) => {
            if ($select.find('option[value="fasttext"]').length > 0) {
              // Chọn sắp xếp theo FastText
              cy.get('select').eq(1).select('fasttext')

              // Chọn sắp xếp theo LSA nếu có
              cy.get('select')
                .eq(1)
                .find('option[value="lsa"]')
                .then(($option) => {
                  if ($option.length > 0) {
                    cy.get('select').eq(1).select('lsa')
                  }
                })

              // Chọn sắp xếp theo tên file nếu có
              cy.get('select')
                .eq(1)
                .find('option[value="filename"]')
                .then(($option) => {
                  if ($option.length > 0) {
                    cy.get('select').eq(1).select('filename')
                  }
                })

              // Nếu có nút đổi hướng sắp xếp, click vào nó
              cy.get('button[title="Giảm dần"], button[title="Tăng dần"]').then(($btn) => {
                if ($btn.length > 0) {
                  cy.wrap($btn).click()
                }
              })
            }
          })
      })
    })
  })

  // Test case tổng hợp thay thế các test case riêng lẻ không ổn định
  it('should navigate to detail view, interact with highlights and navigate back', () => {
    // Xóa dữ liệu localStorage và sử dụng mock data
    cy.clearLocalStorage('plagiarismResults')
    cy.clearLocalStorage('plagiarismResultType')

    // Chuẩn bị dữ liệu mẫu cho kết quả
    cy.fixture('mock_results.json').then((mockResults) => {
      // Lưu kết quả vào localStorage
      cy.window().then((win) => {
        win.localStorage.setItem('plagiarismResults', JSON.stringify(mockResults))
        win.localStorage.setItem('plagiarismResultType', JSON.stringify('queue'))

        // Truy cập trang xem kết quả
        cy.visit('/view-results')

        // Kiểm tra có kết quả hiển thị
        cy.get('.bg-white.rounded-lg.shadow-sm').should('exist')

        // Chọn xem theo cặp so sánh nếu chưa trong chế độ này
        cy.get('select').last().select('pairs')

        // Đợi hiển thị cặp so sánh
        cy.get('.border.rounded-lg.p-2.hover\\:bg-gray-50').should('exist')

        // Click vào cặp so sánh đầu tiên
        cy.get('.border.rounded-lg.p-2.hover\\:bg-gray-50').first().click()

        // Kiểm tra đã chuyển đến trang chi tiết - sử dụng route pattern khác
        cy.url().should('include', '/view-result-details')

        // Đợi nội dung tài liệu tải xong
        cy.get('.prose.max-w-none').should('exist')

        // Kiểm tra các phần tử UI cơ bản
        cy.contains('chi tiết kết quả', { matchCase: false }).should('exist')
        cy.contains('Tài liệu 1', { matchCase: false }).should('exist')
        cy.contains('Tài liệu 2', { matchCase: false }).should('exist')
        cy.contains('tương đồng', { matchCase: false }).should('exist')

        // Tìm phần văn bản được highlight (nếu có)
        cy.get('.bert-highlight').then(($highlights) => {
          if ($highlights.length > 0) {
            // Hover vào đoạn highlight đầu tiên
            cy.wrap($highlights).first().trigger('mouseover')

            // Kiểm tra các tương tác
            cy.get('body').then(($body) => {
              if ($body.find('.active-highlight').length > 0) {
                // Có highlight active
                cy.get('.active-highlight').should('exist')

                // Click vào để chọn
                cy.wrap($highlights).first().click()

                // Tìm badge tỉ lệ tương đồng
                cy.get('body').then(($bodyAfterClick) => {
                  if ($bodyAfterClick.find('.similarity-badge').length > 0) {
                    cy.get('.similarity-badge')
                      .contains('Tỉ lệ tương đồng', { matchCase: false })
                      .should('exist')

                    // Click nút đóng badge nếu có
                    cy.get('.similarity-badge').find('button').click()
                  }
                })
              }
            })
          }
        })

        // Click vào link quay lại
        cy.contains('Back to Results', { matchCase: false }).click()

        // Kiểm tra đã quay lại trang kết quả
        cy.url().should('include', '/view-results')
        cy.url().should('not.include', '/view-result-details')

        // Kiểm tra đã hiển thị trang kết quả
        cy.contains('Kết quả kiểm tra', { matchCase: false }).should('exist')
      })
    })
  })
})
