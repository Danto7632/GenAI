import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">🏠</span>
            <h1>DreamSpace AI</h1>
          </div>
          <p className="subtitle">AI로 꿈꾸는 인테리어를 현실로</p>
        </div>
        <div className="header-right">
          <button className="btn btn-secondary">다시 만들기</button>
          <button className="btn btn-secondary">저장하기</button>
          <button className="btn btn-primary">완성</button>
        </div>
      </header>

      <div className="main-container">
        <aside className="sidebar">
          {/* 이미지 업로드 섹션 */}
          <div className="upload-section">
            <div className="upload-area">
              <div className="upload-placeholder">
                <span className="upload-icon">📷</span>
                <p>다이닝 룸사진</p>
                <button className="upload-btn">사진 선택</button>
              </div>
            </div>
            <p className="upload-description">
              방 사진을 업로드하여 AI가 분석한 공간에<br />
              가구를 배치해보세요
            </p>
          </div>

          {/* 가구 팔레트 */}
          <div className="furniture-palette">
            <h3>가구</h3>
            <div className="furniture-grid">
              <div className="furniture-item">
                <div className="furniture-preview chair"></div>
                <span>의자</span>
              </div>
              <div className="furniture-item">
                <div className="furniture-preview sofa"></div>
                <span>소파</span>
              </div>
              <div className="furniture-item">
                <div className="furniture-preview table"></div>
                <span>테이블</span>
              </div>
              <div className="furniture-item">
                <div className="furniture-preview cabinet"></div>
                <span>수납장</span>
              </div>
            </div>
          </div>

          {/* 침대 섹션 */}
          <div className="furniture-palette">
            <h3>침대</h3>
            <div className="furniture-grid">
              <div className="furniture-item">
                <div className="furniture-preview bed"></div>
                <span>침대</span>
              </div>
              <div className="furniture-item">
                <div className="furniture-preview bed"></div>
                <span>침대</span>
              </div>
              <div className="furniture-item">
                <div className="furniture-preview bed"></div>
                <span>침대</span>
              </div>
              <div className="furniture-item">
                <div className="furniture-preview bed"></div>
                <span>침대</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="canvas-area">
          <div className="canvas-header">
            <span>마우스로 장소를 배치해보세요</span>
            <span className="canvas-size">세로 7.0 칸</span>
          </div>
          <div className="design-canvas">
            <div className="grid-overlay"></div>
            <div className="canvas-placeholder">
              <p>마우스로 장소를 배치해보세요</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;