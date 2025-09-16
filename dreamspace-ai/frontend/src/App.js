import React, { useState } from 'react';
import styled from 'styled-components';

// 스타일드 컴포넌트 정의
const AppContainer = styled.div`
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const Sidebar = styled.div`
  width: 300px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 0 20px 20px 0;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
`;

const MainArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
`;

const Header = styled.div`
  text-align: center;
  padding: 20px 0;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 2.2rem;
  font-weight: 700;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  margin: 10px 0 0 0;
  color: #666;
  font-size: 0.9rem;
  font-weight: 500;
`;

const Section = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h3`
  margin: 0 0 15px 0;
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;
`;

const FurnitureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 20px;
`;

const FurnitureItem = styled.div`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 15px 10px;
  border-radius: 12px;
  text-align: center;
  cursor: grab;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }
  
  &:active {
    cursor: grabbing;
    transform: scale(0.95);
  }
`;

const DesignCanvas = styled.div`
  flex: 1;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  position: relative;
  min-height: 500px;
  background-image: 
    linear-gradient(rgba(102, 126, 234, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(102, 126, 234, 0.1) 1px, transparent 1px);
  background-size: 30px 30px;
  overflow: hidden;
  box-shadow: inset 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const CanvasHeader = styled.div`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 15px 20px;
  border-radius: 20px 20px 0 0;
  font-weight: 600;
  font-size: 1.1rem;
`;

const DroppedFurniture = styled.div`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
  color: white;
  padding: 10px 15px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: move;
  user-select: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  min-width: 60px;
  text-align: center;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
`;

const UploadArea = styled.div`
  border: 2px dashed #667eea;
  border-radius: 15px;
  padding: 30px;
  text-align: center;
  background: rgba(102, 126, 234, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #764ba2;
    background: rgba(118, 75, 162, 0.1);
    transform: translateY(-2px);
  }
`;

const UploadIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 10px;
`;

const UploadText = styled.p`
  margin: 0;
  color: #667eea;
  font-weight: 500;
  font-size: 1rem;
`;

const CategoryTitle = styled.h4`
  margin: 15px 0 10px 0;
  color: #555;
  font-size: 1rem;
  font-weight: 600;
`;

const App = () => {
  const [droppedItems, setDroppedItems] = useState([]);

  const furnitureCategories = {
    '거실': ['소파', '테이블', '의자', '책장', 'TV'],
    '침실': ['침대', '옷장', '화장대', '협탁', '스탠드'],
    '주방': ['냉장고', '가스레인지', '식탁', '수납장', '전자레인지'],
    '화장실': ['세면대', '변기', '샤워부스', '수건걸이', '수납함']
  };

  const handleDragStart = (e, furnitureName) => {
    e.dataTransfer.setData('furnitureName', furnitureName);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const furnitureName = e.dataTransfer.getData('furnitureName');
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 50;
    const y = e.clientY - rect.top - 100;

    const newItem = {
      id: Date.now().toString(),
      name: furnitureName,
      x: Math.max(10, x),
      y: Math.max(70, y)
    };

    setDroppedItems(prev => [...prev, newItem]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFurnitureClick = (item, e) => {
    // 더블클릭으로 가구 제거
    if (e.detail === 2) {
      setDroppedItems(prev => prev.filter(i => i.id !== item.id));
    }
  };

  return (
    <AppContainer>
      <Sidebar>
        <Header>
          <Title>🏠 DreamSpace AI</Title>
          <Subtitle>AI로 꿈꾸는 인테리어를 현실로</Subtitle>
        </Header>
        
        <Section>
          <SectionTitle>📸 방 사진 업로드</SectionTitle>
          <UploadArea>
            <UploadIcon>📷</UploadIcon>
            <UploadText>클릭하여 방 사진을 업로드하세요</UploadText>
          </UploadArea>
        </Section>

        <Section>
          <SectionTitle>🪑 가구 라이브러리</SectionTitle>
          {Object.entries(furnitureCategories).map(([category, items]) => (
            <div key={category}>
              <CategoryTitle>{category}</CategoryTitle>
              <FurnitureGrid>
                {items.map((item) => (
                  <FurnitureItem
                    key={item}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                  >
                    {item}
                  </FurnitureItem>
                ))}
              </FurnitureGrid>
            </div>
          ))}
        </Section>

        <Section>
          <SectionTitle>💡 사용법</SectionTitle>
          <div style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.5' }}>
            • 가구를 캔버스로 드래그하여 배치<br/>
            • 배치된 가구를 더블클릭하면 제거<br/>
            • 게임처럼 자유롭게 꾸며보세요!
          </div>
        </Section>
      </Sidebar>

      <MainArea>
        <DesignCanvas
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <CanvasHeader>
            🎨 인테리어 디자인 캔버스 - 가구를 드래그해서 배치해보세요!
          </CanvasHeader>
          
          {droppedItems.map((item) => (
            <DroppedFurniture
              key={item.id}
              x={item.x}
              y={item.y}
              onClick={(e) => handleFurnitureClick(item, e)}
              title="더블클릭하면 제거됩니다"
            >
              {item.name}
            </DroppedFurniture>
          ))}
          
          {droppedItems.length === 0 && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: '#999',
              fontSize: '1.2rem',
              fontWeight: '500'
            }}>
              왼쪽에서 가구를 드래그해서 여기에 배치해보세요! 🪑✨
            </div>
          )}
        </DesignCanvas>
      </MainArea>
    </AppContainer>
  );
};

export default App;