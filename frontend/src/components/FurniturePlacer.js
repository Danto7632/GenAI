import React, { useState, useRef, useEffect } from 'react';
import './FurniturePlacer.css';

const FurniturePlacer = ({ roomImage, onFurnitureUpdate }) => {
  const [furniture, setFurniture] = useState([]);
  const [selectedFurniture, setSelectedFurniture] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const [roomDimensions, setRoomDimensions] = useState({ width: 800, height: 600 });

  // 가구 카테고리와 아이템들
  const furnitureCategories = {
    '의자': [
      { id: 'chair1', name: '사무용 의자', icon: '🪑', width: 50, height: 50 },
      { id: 'chair2', name: '안락의자', icon: '🛋️', width: 80, height: 80 },
      { id: 'chair3', name: '바 의자', icon: '🪑', width: 40, height: 40 }
    ],
    '테이블': [
      { id: 'table1', name: '식탁', icon: '🍽️', width: 120, height: 80 },
      { id: 'table2', name: '커피테이블', icon: '☕', width: 100, height: 60 },
      { id: 'table3', name: '책상', icon: '🖥️', width: 140, height: 70 }
    ],
    '수납': [
      { id: 'storage1', name: '옷장', icon: '🚪', width: 100, height: 40 },
      { id: 'storage2', name: '책장', icon: '📚', width: 80, height: 30 },
      { id: 'storage3', name: '서랍장', icon: '🗃️', width: 60, height: 40 }
    ],
    '침실': [
      { id: 'bed1', name: '싱글베드', icon: '🛏️', width: 100, height: 180 },
      { id: 'bed2', name: '더블베드', icon: '🛏️', width: 140, height: 200 },
      { id: 'bed3', name: '소파베드', icon: '🛋️', width: 160, height: 80 }
    ]
  };

  const [activeCategory, setActiveCategory] = useState('의자');

  // 방 이미지가 변경되면 가구 초기화
  useEffect(() => {
    if (roomImage) {
      setFurniture([]);
      // 이미지 크기에 따라 캔버스 크기 조정
      const img = new Image();
      img.onload = () => {
        const maxWidth = 800;
        const maxHeight = 600;
        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
        setRoomDimensions({
          width: img.width * ratio,
          height: img.height * ratio
        });
      };
      img.src = roomImage;
    }
  }, [roomImage]);

  // 드래그 시작
  const handleDragStart = (e, furnitureItem) => {
    e.dataTransfer.setData('furniture', JSON.stringify(furnitureItem));
    setDraggedItem(furnitureItem);
  };

  // 캔버스에 드롭
  const handleDrop = (e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (draggedItem) {
      const newFurniture = {
        ...draggedItem,
        id: Date.now(), // 고유 ID 생성
        x: x - draggedItem.width / 2,
        y: y - draggedItem.height / 2,
        rotation: 0
      };

      setFurniture(prev => [...prev, newFurniture]);
      setDraggedItem(null);
      onFurnitureUpdate && onFurnitureUpdate([...furniture, newFurniture]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // 배치된 가구 선택
  const handleFurnitureClick = (furnitureItem) => {
    setSelectedFurniture(furnitureItem);
  };

  // 가구 이동
  const handleFurnitureMouseDown = (e, furnitureItem) => {
    e.stopPropagation();
    const rect = canvasRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left - furnitureItem.x,
      y: e.clientY - rect.top - furnitureItem.y
    });
    setSelectedFurniture(furnitureItem);
  };

  const handleMouseMove = (e) => {
    if (selectedFurniture && dragOffset) {
      const rect = canvasRef.current.getBoundingClientRect();
      const newX = e.clientX - rect.left - dragOffset.x;
      const newY = e.clientY - rect.top - dragOffset.y;

      setFurniture(prev => prev.map(item => 
        item.id === selectedFurniture.id 
          ? { ...item, x: newX, y: newY }
          : item
      ));
    }
  };

  const handleMouseUp = () => {
    setDragOffset(null);
  };

  // 가구 삭제
  const deleteFurniture = () => {
    if (selectedFurniture) {
      setFurniture(prev => prev.filter(item => item.id !== selectedFurniture.id));
      setSelectedFurniture(null);
    }
  };

  // 가구 회전
  const rotateFurniture = () => {
    if (selectedFurniture) {
      setFurniture(prev => prev.map(item => 
        item.id === selectedFurniture.id 
          ? { ...item, rotation: (item.rotation + 90) % 360 }
          : item
      ));
    }
  };

  return (
    <div className="furniture-placer">
      <div className="sidebar">
        <h3>가구 라이브러리</h3>
        
        {/* 카테고리 탭 */}
        <div className="category-tabs">
          {Object.keys(furnitureCategories).map(category => (
            <button
              key={category}
              className={`category-tab ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* 가구 아이템들 */}
        <div className="furniture-items">
          {furnitureCategories[activeCategory].map(item => (
            <div
              key={item.id}
              className="furniture-item"
              draggable
              onDragStart={(e) => handleDragStart(e, item)}
            >
              <div className="furniture-icon">{item.icon}</div>
              <div className="furniture-name">{item.name}</div>
            </div>
          ))}
        </div>

        {/* 선택된 가구 컨트롤 */}
        {selectedFurniture && (
          <div className="furniture-controls">
            <h4>선택된 가구</h4>
            <p>{selectedFurniture.name}</p>
            <button onClick={rotateFurniture} className="control-btn">
              🔄 회전
            </button>
            <button onClick={deleteFurniture} className="control-btn delete">
              🗑️ 삭제
            </button>
          </div>
        )}
      </div>

      <div className="main-area">
        <div className="canvas-container">
          <canvas
            ref={canvasRef}
            width={roomDimensions.width}
            height={roomDimensions.height}
            className="room-canvas"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{
              backgroundImage: roomImage ? `url(${roomImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* 배치된 가구들 렌더링 */}
            {furniture.map(item => (
              <div
                key={item.id}
                className={`placed-furniture ${selectedFurniture?.id === item.id ? 'selected' : ''}`}
                style={{
                  position: 'absolute',
                  left: item.x,
                  top: item.y,
                  width: item.width,
                  height: item.height,
                  transform: `rotate(${item.rotation}deg)`,
                  cursor: 'move'
                }}
                onMouseDown={(e) => handleFurnitureMouseDown(e, item)}
                onClick={() => handleFurnitureClick(item)}
              >
                <div className="furniture-visual">
                  {item.icon}
                </div>
              </div>
            ))}
          </canvas>
        </div>

        <div className="action-buttons">
          <button className="action-btn save">💾 저장하기</button>
          <button className="action-btn generate">🎨 3D 렌더링</button>
          <button className="action-btn ai">🤖 AI 추천</button>
        </div>
      </div>
    </div>
  );
};

export default FurniturePlacer;