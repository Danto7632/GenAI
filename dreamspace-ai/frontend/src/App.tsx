import React, { useState } from 'react';

interface FurnitureItem {
  id: string;
  name: string;
  x: number;
  y: number;
}

const App: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [furniture, setFurniture] = useState<FurnitureItem[]>([]);
  const [selectedFurniture, setSelectedFurniture] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<string>('');

  // 가구 목록
  const furnitureTypes = ['소파', '테이블', '의자', '침대', '옷장', '책장', '냉장고', '세면대'];

  // 가장 기본적인 파일 업로드
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('파일 선택됨:', file.name);
    setIsUploading(true);
    setMessage('업로드 중...');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:5001/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setUploadedImage(result.image_url);
        setMessage('✅ 업로드 성공!');
      } else {
        setMessage('❌ 업로드 실패');
      }
    } catch (error) {
      setMessage('❌ 서버 연결 실패');
    } finally {
      setIsUploading(false);
    }
  };

  // 가구 배치
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedFurniture || !uploadedImage) return;

    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - 30;
    const y = e.clientY - rect.top - 15;

    const newFurniture: FurnitureItem = {
      id: Date.now().toString(),
      name: selectedFurniture,
      x: Math.max(0, x),
      y: Math.max(0, y)
    };

    setFurniture(prev => [...prev, newFurniture]);
    setSelectedFurniture(null);
  };

  // AI 생성
  const handleAIGenerate = async () => {
    if (!uploadedImage || furniture.length === 0) {
      setMessage('❌ 이미지와 가구가 필요합니다');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:5001/api/ai/generate-interior', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: uploadedImage,
          furniture_layout: furniture
        })
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(`✅ AI 생성 완료! ID: ${result.generation_id}`);
      } else {
        setMessage('❌ AI 생성 실패');
      }
    } catch (error) {
      setMessage('❌ AI 요청 실패');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      {/* 좌측 사이드바 */}
      <div style={{ 
        width: '300px', 
        background: 'white', 
        padding: '20px',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
      }}>
        
        {/* 제목 */}
        <div style={{ 
          background: 'linear-gradient(45deg, #667eea, #764ba2)',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <h1 style={{ margin: 0, fontSize: '20px' }}>🏠 DreamSpace AI</h1>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>AI 인테리어 디자인</p>
        </div>

        {/* 파일 업로드 - 가장 기본적인 방식 */}
        <div style={{ marginBottom: '20px' }}>
          <h3>📸 이미지 업로드</h3>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px dashed #ccc',
                borderRadius: '5px',
                background: '#f9f9f9'
              }}
            />
            {isUploading && <p>⏳ 업로드 중...</p>}
            {uploadedImage && <p>✅ 업로드 완료!</p>}
          </div>
        </div>

        {/* 가구 선택 */}
        <div style={{ marginBottom: '20px' }}>
          <h3>🪑 가구 선택</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '10px' 
          }}>
            {furnitureTypes.map(type => (
              <button
                key={type}
                onClick={() => setSelectedFurniture(type)}
                style={{
                  padding: '10px',
                  border: selectedFurniture === type ? '2px solid #667eea' : '2px solid #ddd',
                  background: selectedFurniture === type ? '#667eea' : 'white',
                  color: selectedFurniture === type ? 'white' : '#333',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                {type}
              </button>
            ))}
          </div>
          {selectedFurniture && (
            <p style={{ fontSize: '12px', color: '#667eea' }}>
              '{selectedFurniture}' 선택됨 - 캔버스 클릭하여 배치
            </p>
          )}
        </div>

        {/* AI 생성 버튼 */}
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={handleAIGenerate}
            disabled={!uploadedImage || furniture.length === 0 || isGenerating}
            style={{
              width: '100%',
              padding: '15px',
              background: uploadedImage && furniture.length > 0 && !isGenerating 
                ? 'linear-gradient(45deg, #667eea, #764ba2)' 
                : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: uploadedImage && furniture.length > 0 && !isGenerating ? 'pointer' : 'not-allowed'
            }}
          >
            {isGenerating ? '🎨 AI 생성 중...' : '🚀 AI 인테리어 생성'}
          </button>
        </div>

        {/* 메시지 */}
        {message && (
          <div style={{
            padding: '10px',
            background: message.includes('✅') ? '#d4edda' : '#f8d7da',
            color: message.includes('✅') ? '#155724' : '#721c24',
            border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '5px',
            fontSize: '14px'
          }}>
            {message}
          </div>
        )}
      </div>

      {/* 우측 캔버스 */}
      <div style={{ flex: 1, padding: '20px', background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
        <div
          onClick={handleCanvasClick}
          style={{
            width: '100%',
            height: '600px',
            background: 'white',
            borderRadius: '10px',
            position: 'relative',
            overflow: 'hidden',
            cursor: selectedFurniture ? 'crosshair' : 'default'
          }}
        >
          {uploadedImage ? (
            <>
              <img
                src={uploadedImage}
                alt="업로드된 이미지"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
              {furniture.map(item => (
                <div
                  key={item.id}
                  onDoubleClick={() => setFurniture(prev => prev.filter(f => f.id !== item.id))}
                  style={{
                    position: 'absolute',
                    left: item.x,
                    top: item.y,
                    background: 'rgba(102, 126, 234, 0.9)',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  title="더블클릭하여 제거"
                >
                  {item.name}
                </div>
              ))}
            </>
          ) : (
            <div style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999',
              fontSize: '18px'
            }}>
              이미지를 업로드하면 여기에 표시됩니다
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;