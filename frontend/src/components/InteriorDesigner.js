import React, { useState, useCallback } from 'react';
import ImageUploader from './ImageUploader';
import FurniturePlacer from './FurniturePlacer';
import './InteriorDesigner.css';

const InteriorDesigner = () => {
  const [roomImage, setRoomImage] = useState(null);
  const [roomAnalysis, setRoomAnalysis] = useState(null);
  const [currentStep, setCurrentStep] = useState('upload'); // 'upload', 'design', 'render'
  const [furnitureLayout, setFurnitureLayout] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 이미지 업로드 완료 후 공간 분석
  const handleImageUpload = useCallback(async (imageFile, imageUrl) => {
    setRoomImage(imageUrl);
    setIsAnalyzing(true);
    
    try {
      // 백엔드 API 호출하여 공간 분석
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await fetch('http://localhost:5000/api/analyze-room', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const analysis = await response.json();
        setRoomAnalysis(analysis);
        setCurrentStep('design');
      } else {
        console.error('공간 분석 실패');
        // 실패해도 디자인 단계로 진행 (데모용)
        setCurrentStep('design');
      }
    } catch (error) {
      console.error('공간 분석 오류:', error);
      // 오류가 있어도 디자인 단계로 진행 (데모용)
      setCurrentStep('design');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // 가구 배치 업데이트
  const handleFurnitureUpdate = useCallback((newLayout) => {
    setFurnitureLayout(newLayout);
  }, []);

  // 3D 렌더링 요청
  const handleGenerateRender = async () => {
    setCurrentStep('render');
    
    try {
      const response = await fetch('http://localhost:5000/api/generate-render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          roomImage: roomImage,
          furnitureLayout: furnitureLayout,
          roomAnalysis: roomAnalysis
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('3D 렌더링 완료:', result);
        // 결과 처리
      }
    } catch (error) {
      console.error('3D 렌더링 오류:', error);
    }
  };

  // 새 프로젝트 시작
  const startNewProject = () => {
    setRoomImage(null);
    setRoomAnalysis(null);
    setFurnitureLayout([]);
    setCurrentStep('upload');
  };

  return (
    <div className="interior-designer">
      {/* 헤더 */}
      <header className="designer-header">
        <div className="header-content">
          <h1>🏠 DreamSpace AI</h1>
          <p>AI와 함께 꿈꾸는 공간을 디자인하세요</p>
          
          {/* 진행 단계 표시 */}
          <div className="progress-steps">
            <div className={`step ${currentStep === 'upload' ? 'active' : currentStep !== 'upload' ? 'completed' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-text">사진 업로드</span>
            </div>
            <div className={`step ${currentStep === 'design' ? 'active' : currentStep === 'render' ? 'completed' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-text">가구 배치</span>
            </div>
            <div className={`step ${currentStep === 'render' ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-text">3D 렌더링</span>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="designer-main">
        {currentStep === 'upload' && (
          <div className="upload-section">
            <div className="section-header">
              <h2>📸 방 사진을 업로드해주세요</h2>
              <p>도면이나 실제 방 사진을 업로드하시면 AI가 공간을 분석합니다</p>
            </div>
            <ImageUploader onImageUpload={handleImageUpload} />
            
            {isAnalyzing && (
              <div className="analyzing-overlay">
                <div className="loading-spinner"></div>
                <p>AI가 공간을 분석하고 있습니다...</p>
              </div>
            )}
          </div>
        )}

        {currentStep === 'design' && roomImage && (
          <div className="design-section">
            <div className="section-header">
              <h2>🎨 가구를 배치해보세요</h2>
              <p>드래그 앤 드롭으로 가구를 자유롭게 배치할 수 있습니다</p>
              
              {roomAnalysis && (
                <div className="room-info">
                  <h3>📊 공간 분석 결과</h3>
                  <div className="analysis-details">
                    <span>공간 타입: {roomAnalysis.roomType || '거실'}</span>
                    <span>추정 크기: {roomAnalysis.estimatedSize || '약 20㎡'}</span>
                    <span>자연광: {roomAnalysis.lighting || '양호'}</span>
                  </div>
                </div>
              )}
            </div>
            
            <FurniturePlacer 
              roomImage={roomImage}
              onFurnitureUpdate={handleFurnitureUpdate}
            />
            
            <div className="design-actions">
              <button onClick={startNewProject} className="secondary-btn">
                🔄 새로 시작하기
              </button>
              <button 
                onClick={handleGenerateRender} 
                className="primary-btn"
                disabled={furnitureLayout.length === 0}
              >
                🎯 3D 렌더링 생성
              </button>
            </div>
          </div>
        )}

        {currentStep === 'render' && (
          <div className="render-section">
            <div className="section-header">
              <h2>🌟 3D 렌더링</h2>
              <p>AI가 생성한 3D 렌더링 결과입니다</p>
            </div>
            
            <div className="render-placeholder">
              <div className="loading-spinner large"></div>
              <p>고품질 3D 렌더링을 생성하고 있습니다...</p>
              <small>이 과정은 약 30-60초 소요됩니다</small>
            </div>
            
            <div className="render-actions">
              <button onClick={() => setCurrentStep('design')} className="secondary-btn">
                ← 가구 배치로 돌아가기
              </button>
              <button onClick={startNewProject} className="secondary-btn">
                🏠 새 프로젝트 시작
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default InteriorDesigner;