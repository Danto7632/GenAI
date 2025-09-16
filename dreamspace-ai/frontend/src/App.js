import React, { useState, useRef } from 'react';
import './App.css';

const App = () => {
  const [image, setImage] = useState(null);
  const [furniture, setFurniture] = useState([]);
  const [selected, setSelected] = useState('');
  const [selectedFurniture, setSelectedFurniture] = useState(null);
  const [message, setMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [customFurniture, setCustomFurniture] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const canvasRef = useRef(null);

  const furnitureTypes = ['소파', '테이블', '의자', '침대', '옷장', '책장'];

  // 사용자 정의 가구 추가
  const addCustomFurniture = () => {
    if (customFurniture.trim() && !furnitureTypes.includes(customFurniture.trim())) {
      setSelected(customFurniture.trim());
      setCustomFurniture('');
      setShowCustomInput(false);
      setMessage(`✅ '${customFurniture.trim()}' 가구가 선택되었습니다`);
    } else if (furnitureTypes.includes(customFurniture.trim())) {
      setMessage('❌ 이미 존재하는 가구입니다');
    } else {
      setMessage('❌ 가구명을 입력해주세요');
    }
  };

  // 파일 업로드
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMessage('📤 업로드 중...');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Uploading file:', file.name);
      
      const response = await fetch('http://localhost:5001/upload', {
        method: 'POST',
        body: formData,
        // CORS 관련 헤더는 자동으로 설정됨
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Upload result:', result);
      
      if (result.success) {
        setImage(`http://localhost:5001${result.url}`);
        setMessage('✅ 업로드 성공!');
      } else {
        setMessage(`❌ 업로드 실패: ${result.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage(`❌ 업로드 실패: ${error.message}`);
    }
  };

  // 가구 배치
  const handleCanvasClick = (e) => {
    if (!selected || !image || isDragging || isResizing || isRotating) return;

    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newFurniture = {
      id: Date.now(),
      name: selected,
      x: x - 30,
      y: y - 15,
      width: 60,
      height: 30,
      rotation: 0
    };

    setFurniture([...furniture, newFurniture]);
    setSelected('');
    setSelectedFurniture(newFurniture.id);
  };

  // 가구 선택
  const handleFurnitureClick = (e, furnitureId) => {
    e.stopPropagation();
    setSelectedFurniture(furnitureId);
  };

  // 드래그 시작
  const handleMouseDown = (e, furnitureId, action = 'drag') => {
    e.stopPropagation();
    setSelectedFurniture(furnitureId);
    
    if (action === 'drag') {
      setIsDragging(true);
    } else if (action === 'resize') {
      setIsResizing(true);
    } else if (action === 'rotate') {
      setIsRotating(true);
    }

    const rect = canvasRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // 마우스 이동
  const handleMouseMove = (e) => {
    if (!selectedFurniture || (!isDragging && !isResizing && !isRotating)) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    setFurniture(prev => prev.map(item => {
      if (item.id === selectedFurniture) {
        if (isDragging) {
          return {
            ...item,
            x: item.x + (currentX - dragStart.x),
            y: item.y + (currentY - dragStart.y)
          };
        } else if (isResizing) {
          const newWidth = Math.max(20, item.width + (currentX - dragStart.x));
          const newHeight = Math.max(15, item.height + (currentY - dragStart.y));
          return { ...item, width: newWidth, height: newHeight };
        } else if (isRotating) {
          const centerX = item.x + item.width / 2;
          const centerY = item.y + item.height / 2;
          const angle = Math.atan2(currentY - centerY, currentX - centerX);
          return { ...item, rotation: (angle * 180 / Math.PI) + 90 };
        }
      }
      return item;
    }));

    setDragStart({ x: currentX, y: currentY });
  };

  // 마우스 업
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
  };

  // 가구 삭제
  const deleteFurniture = (furnitureId) => {
    setFurniture(furniture.filter(f => f.id !== furnitureId));
    setSelectedFurniture(null);
  };

  // 캔버스를 이미지로 캡처
  const captureCanvas = async () => {
    if (!canvasRef.current) return null;

    // HTML2Canvas 라이브러리 동적 로드
    const html2canvas = await import('html2canvas');
    const canvas = await html2canvas.default(canvasRef.current, {
      useCORS: true,
      allowTaint: true,
      scale: 1
    });

    return canvas.toDataURL('image/png');
  };

    // AI 생성 (캔버스 전체 캡처)
  const handleGenerate = async () => {
    if (!image || furniture.length === 0) {
      setMessage('❌ 이미지와 가구가 필요합니다');
      return;
    }

    setMessage('🎨 캔버스 캡처 중...');

    try {
      // 캔버스 전체를 이미지로 캡처
      const canvasImage = await captureCanvas();
      
      if (!canvasImage) {
        setMessage('❌ 캔버스 캡처 실패');
        return;
      }

      setMessage('🤖 AI 생성 중...');

      // 캡처된 이미지와 가구 정보를 백엔드에 전송
      const response = await fetch('http://localhost:5001/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          canvas_image: canvasImage,
          original_image: image,
          furniture: furniture.map(f => ({
            name: f.name,
            x: f.x,
            y: f.y,
            width: f.width,
            height: f.height,
            rotation: f.rotation
          }))
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMessage(`✅ AI 생성 완료! ID: ${result.generation_id}`);
      } else {
        setMessage(`❌ AI 생성 실패: ${result.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('Generate error:', error);
      setMessage(`❌ AI 생성 실패: ${error.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial' }}>
      {/* 좌측 패널 */}
      <div style={{ width: '300px', padding: '20px', background: '#f5f5f5', borderRight: '1px solid #ddd' }}>
        <h1 style={{ fontSize: '20px', margin: '0 0 20px 0' }}>🏠 DreamSpace AI</h1>
        
        {/* 파일 업로드 */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>📸 이미지 업로드</h3>
          <input type="file" accept="image/*" onChange={handleUpload} />
        </div>

        {/* 가구 선택 */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>🪑 가구 선택</h3>
          
          {/* 기본 가구 버튼들 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '5px', marginBottom: '10px' }}>
            {furnitureTypes.map(type => (
              <button
                key={type}
                onClick={() => setSelected(type)}
                style={{
                  padding: '8px',
                  background: selected === type ? '#007bff' : 'white',
                  color: selected === type ? 'white' : 'black',
                  border: '1px solid #ccc',
                  cursor: 'pointer',
                  borderRadius: '4px'
                }}
              >
                {type}
              </button>
            ))}
          </div>

          {/* 사용자 정의 가구 추가 버튼 */}
          <button
            onClick={() => setShowCustomInput(!showCustomInput)}
            style={{
              width: '100%',
              padding: '8px',
              background: showCustomInput ? '#ffc107' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              marginBottom: '10px'
            }}
          >
            {showCustomInput ? '❌ 취소' : '➕ 직접 입력'}
          </button>

          {/* 사용자 정의 가구 입력 필드 */}
          {showCustomInput && (
            <div style={{ 
              background: '#f8f9fa', 
              padding: '10px', 
              borderRadius: '4px',
              border: '1px solid #dee2e6',
              marginBottom: '10px'
            }}>
              <input
                type="text"
                value={customFurniture}
                onChange={(e) => setCustomFurniture(e.target.value)}
                placeholder="가구명을 입력하세요 (예: 화분, 스탠드, 거울)"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  marginBottom: '8px',
                  fontSize: '14px'
                }}
                onKeyPress={(e) => e.key === 'Enter' && addCustomFurniture()}
              />
              <button
                onClick={addCustomFurniture}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                ✅ 추가하기
              </button>
            </div>
          )}

          {selected && <p style={{ fontSize: '12px', color: '#007bff', margin: '10px 0 0 0' }}>
            '{selected}' 선택됨 - 캔버스 클릭하여 배치
          </p>}
        </div>

        {/* 컨트롤 패널 */}
        {selectedFurniture && (
          <div style={{
            marginBottom: '20px',
            padding: '15px',
            background: '#e3f2fd',
            borderRadius: '8px',
            border: '2px solid #2196f3'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>🎛️ 가구 컨트롤</h4>
            <p style={{ margin: '0 0 10px 0', fontSize: '12px' }}>
              선택된 가구를 조작할 수 있습니다
            </p>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              <button
                style={{
                  padding: '5px 10px',
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
                onClick={() => deleteFurniture(selectedFurniture)}
              >
                🗑️ 삭제
              </button>
              <span style={{ fontSize: '11px', color: '#666', alignSelf: 'center' }}>
                드래그=이동 | 우하단=크기 | 우상단=회전
              </span>
            </div>
          </div>
        )}
        <button
          onClick={handleGenerate}
          disabled={!image || furniture.length === 0}
          style={{
            width: '100%',
            padding: '15px',
            background: image && furniture.length > 0 ? '#28a745' : '#ccc',
            color: 'white',
            border: 'none',
            cursor: image && furniture.length > 0 ? 'pointer' : 'not-allowed',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          🚀 AI 인테리어 생성
        </button>

        {/* 메시지 */}
        {message && (
          <div style={{
            marginTop: '20px',
            padding: '10px',
            background: message.includes('✅') ? '#d4edda' : '#f8d7da',
            color: message.includes('✅') ? '#155724' : '#721c24',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            {message}
          </div>
        )}
      </div>

      {/* 우측 인터랙티브 캔버스 */}
      <div style={{ flex: 1, padding: '20px', background: 'white' }}>
        <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
          💡 <strong>사용법:</strong> 가구 선택 → 캔버스 클릭 → 드래그로 이동, 모서리로 크기/회전 조정
        </div>
        
        <div
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            width: '100%',
            height: '600px',
            border: '2px solid #ccc',
            position: 'relative',
            background: 'white',
            cursor: selected ? 'crosshair' : 'default',
            borderRadius: '4px',
            overflow: 'hidden',
            userSelect: 'none'
          }}
        >
          {image ? (
            <>
              <img
                src={image}
                alt="업로드된 이미지"
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain',
                  pointerEvents: 'none'
                }}
                draggable={false}
              />
              {furniture.map(item => (
                <div
                  key={item.id}
                  onClick={(e) => handleFurnitureClick(e, item.id)}
                  style={{
                    position: 'absolute',
                    left: item.x,
                    top: item.y,
                    width: item.width,
                    height: item.height,
                    background: selectedFurniture === item.id 
                      ? 'rgba(33, 150, 243, 0.8)' 
                      : 'rgba(0, 123, 255, 0.7)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: Math.min(item.width / 4, item.height / 2, 14),
                    cursor: isDragging ? 'grabbing' : 'grab',
                    borderRadius: '4px',
                    border: selectedFurniture === item.id ? '2px solid #1976d2' : '1px solid rgba(255,255,255,0.3)',
                    transform: `rotate(${item.rotation}deg)`,
                    transformOrigin: 'center center',
                    boxSizing: 'border-box',
                    fontWeight: 'bold',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, item.id, 'drag')}
                >
                  {item.name}
                  
                  {/* 선택된 가구의 컨트롤 핸들들 */}
                  {selectedFurniture === item.id && (
                    <>
                      {/* 크기 조정 핸들 (우하단) */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '-4px',
                          right: '-4px',
                          width: '8px',
                          height: '8px',
                          background: '#ff9800',
                          cursor: 'nw-resize',
                          borderRadius: '2px',
                          border: '1px solid white'
                        }}
                        onMouseDown={(e) => handleMouseDown(e, item.id, 'resize')}
                      />
                      
                      {/* 회전 핸들 (우상단) */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '-4px',
                          right: '-4px',
                          width: '8px',
                          height: '8px',
                          background: '#4caf50',
                          cursor: 'crosshair',
                          borderRadius: '50%',
                          border: '1px solid white'
                        }}
                        onMouseDown={(e) => handleMouseDown(e, item.id, 'rotate')}
                      />
                    </>
                  )}
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
              fontSize: '18px',
              flexDirection: 'column'
            }}>
              <div>📷 이미지를 업로드하세요</div>
              <div style={{ fontSize: '14px', marginTop: '10px' }}>
                업로드 후 가구를 배치하고 드래그&드롭으로 조정 가능합니다
              </div>
            </div>
          )}
        </div>
        
        {/* 캔버스 정보 */}
        {furniture.length > 0 && (
          <div style={{
            marginTop: '10px',
            padding: '10px',
            background: '#f8f9fa',
            borderRadius: '4px',
            fontSize: '12px',
            color: '#666'
          }}>
            📊 배치된 가구: {furniture.length}개 | 
            {selectedFurniture && ` 선택됨: ${furniture.find(f => f.id === selectedFurniture)?.name || ''}`}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;