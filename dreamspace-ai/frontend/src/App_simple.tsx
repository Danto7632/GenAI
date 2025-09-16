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
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
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
  cursor: crosshair;
`;

const CanvasHeader = styled.div`
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 15px 20px;
  border-radius: 20px 20px 0 0;
  font-weight: 600;
  font-size: 1.1rem;
`;

const DroppedFurniture = styled.div<{ x: number; y: number }>`
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
  color: white;
  padding: 10px 15px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
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

const HiddenInput = styled.input`
  display: none;
`;

const UploadedImage = styled.img`
  max-width: 100%;
  max-height: 150px;
  border-radius: 10px;
  margin-top: 10px;
  object-fit: cover;
`;

const GenerateButton = styled.button`
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
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

interface DroppedItem {
  id: string;
  name: string;
  x: number;
  y: number;
}

const App: React.FC = () => {
  const [droppedItems, setDroppedItems] = useState<DroppedItem[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFurniture, setSelectedFurniture] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const furnitureCategories = {
    '거실': ['소파', '테이블', '의자', '책장', 'TV'],
    '침실': ['침대', '옷장', '화장대', '협탁', '스탠드'],
    '주방': ['냉장고', '가스레인지', '식탁', '수납장', '전자레인지'],
    '화장실': ['세면대', '변기', '샤워부스', '수건걸이', '수납함']
  };

  // 가구 선택
  const handleFurnitureSelect = (furnitureName: string) => {
    setSelectedFurniture(furnitureName);
  };

  // 캔버스 클릭으로 가구 배치 (위치 보정 적용)
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!selectedFurniture) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const headerHeight = 60; // CanvasHeader의 높이
    
    // 배치 위치 보정: 클릭한 위치에서 약간 더 아래로 배치
    const x = e.clientX - rect.left - 30; // 가구 중앙 정렬
    const y = e.clientY - rect.top - headerHeight + 20; // 더 아래로 배치되도록 +20 추가

    const newItem: DroppedItem = {
      id: Date.now().toString(),
      name: selectedFurniture,
      x: Math.max(0, x),
      y: Math.max(0, y)
    };

    setDroppedItems(prev => [...prev, newItem]);
    setSelectedFurniture(null); // 배치 후 선택 해제
  };

  // 가구 제거 (더블클릭)
  const handleFurnitureClick = (item: DroppedItem, e: React.MouseEvent) => {
    e.stopPropagation(); // 캔버스 클릭 이벤트 방지
    if (e.detail === 2) { // 더블클릭
      setDroppedItems(prev => prev.filter(i => i.id !== item.id));
    }
  };

  // 이미지 업로드
  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:5000/api/upload/image', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setUploadedImage(result.image_url);
        console.log('분석 결과:', result.analysis);
      } else {
        throw new Error(result.error || '업로드 실패');
      }
      
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      alert('이미지 업로드에 실패했습니다: ' + (error as Error).message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  // AI 인테리어 생성
  const handleGenerateInterior = async () => {
    if (!uploadedImage || droppedItems.length === 0) {
      alert('도면 이미지와 가구 배치가 필요합니다.');
      return;
    }
    
    setIsGenerating(true);
    try {
      // TODO: AI 인테리어 생성 API 호출
      console.log('AI 인테리어 생성 요청:', {
        image: uploadedImage,
        furniture: droppedItems
      });
      
      // 임시로 3초 후 완료
      await new Promise(resolve => setTimeout(resolve, 3000));
      alert('AI 인테리어가 생성되었습니다!');
      
    } catch (error) {
      console.error('AI 인테리어 생성 오류:', error);
      alert('AI 인테리어 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
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
          <SectionTitle>📸 도면 업로드</SectionTitle>
          <UploadArea onClick={handleUploadClick}>
            {isUploading ? (
              <>
                <UploadIcon>⏳</UploadIcon>
                <UploadText>업로드 중...</UploadText>
              </>
            ) : uploadedImage ? (
              <>
                <UploadedImage src={uploadedImage} alt="업로드된 도면" />
                <UploadText>도면이 업로드되었습니다!</UploadText>
              </>
            ) : (
              <>
                <UploadIcon>📷</UploadIcon>
                <UploadText>클릭하여 집 도면을 업로드하세요</UploadText>
              </>
            )}
          </UploadArea>
          <HiddenInput
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
          />
        </Section>

        <Section>
          <SectionTitle>🪑 가구 선택</SectionTitle>
          {selectedFurniture && (
            <div style={{ padding: '10px', background: '#e3f2fd', borderRadius: '8px', marginBottom: '15px', textAlign: 'center' }}>
              <strong>선택됨: {selectedFurniture}</strong>
              <br />
              <small>캔버스를 클릭하여 배치하세요</small>
            </div>
          )}
          {Object.entries(furnitureCategories).map(([category, items]) => (
            <div key={category}>
              <CategoryTitle>{category}</CategoryTitle>
              <FurnitureGrid>
                {items.map((item) => (
                  <FurnitureItem
                    key={item}
                    onClick={() => handleFurnitureSelect(item)}
                    style={{
                      background: selectedFurniture === item 
                        ? 'linear-gradient(135deg, #4caf50, #8bc34a)' 
                        : 'linear-gradient(135deg, #667eea, #764ba2)'
                    }}
                  >
                    {item}
                  </FurnitureItem>
                ))}
              </FurnitureGrid>
            </div>
          ))}
        </Section>

        <GenerateButton 
          onClick={handleGenerateInterior}
          disabled={!uploadedImage || droppedItems.length === 0 || isGenerating}
        >
          {isGenerating ? '🎨 AI 인테리어 생성 중...' : '🎨 AI 인테리어 생성'}
        </GenerateButton>
      </Sidebar>

      <MainArea>
        <DesignCanvas onClick={handleCanvasClick}>
          <CanvasHeader>
            🎨 인테리어 디자인 캔버스 - 가구를 선택하고 클릭하여 배치하세요! (더블클릭으로 제거)
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
        </DesignCanvas>
      </MainArea>
    </AppContainer>
  );
};

export default App;