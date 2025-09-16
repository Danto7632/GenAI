# SANA AI Integration Module
# 현재는 하드웨어 제약으로 인해 모의 구현
# 실제 GPU/RAM 환경에서는 이 파일의 주석을 해제하고 SANA 모델을 로드

import os
import base64
import json
import uuid
from PIL import Image, ImageDraw, ImageFont
import io

class SanaAIManager:
    def __init__(self):
        self.mock_mode = True  # 실제 환경에서는 False로 변경
        self.model_loaded = False
        
    def load_sana_model(self):
        """
        실제 환경에서 SANA 모델을 로드하는 함수
        현재는 하드웨어 제약으로 모의 구현
        """
        if self.mock_mode:
            print("🔧 Mock mode: SANA model loading skipped")
            self.model_loaded = True
            return True
            
        # 실제 SANA 모델 로드 코드 (주석 처리됨)
        """
        try:
            import torch
            from diffusers import SanaPipeline
            
            self.pipe = SanaPipeline.from_pretrained(
                "Efficient-Large-Model/Sana_600M_512px_diffusers",
                variant="fp16",
                torch_dtype=torch.float16,
            )
            self.pipe.to("cuda")
            self.pipe.vae.to(torch.bfloat16)
            self.pipe.text_encoder.to(torch.bfloat16)
            
            self.model_loaded = True
            print("✅ SANA model loaded successfully")
            return True
        except Exception as e:
            print(f"❌ Failed to load SANA model: {e}")
            return False
        """
    
    def generate_interior_from_canvas(self, canvas_data, furniture_info, original_image_path=None):
        """
        캔버스 데이터와 가구 정보를 바탕으로 AI 인테리어 이미지 생성
        
        Args:
            canvas_data: 캔버스 이미지 (base64 또는 파일 경로)
            furniture_info: 가구 배치 정보 리스트
            original_image_path: 원본 도면/집사진 경로
        
        Returns:
            generated_image_path: 생성된 이미지 파일 경로
        """
        if not self.model_loaded:
            self.load_sana_model()
        
        # 가구 정보로부터 프롬프트 생성
        prompt = self._create_prompt_from_furniture(furniture_info, original_image_path)
        
        if self.mock_mode:
            return self._mock_generate_interior(canvas_data, furniture_info, prompt)
        
        # 실제 SANA 생성 코드 (주석 처리됨)
        """
        try:
            import torch
            
            # 캔버스 이미지를 조건으로 사용 (img2img 방식)
            generated_image = self.pipe(
                prompt=prompt,
                height=512,
                width=512,
                guidance_scale=4.5,
                num_inference_steps=20,
                generator=torch.Generator(device="cuda").manual_seed(42),
            )[0]
            
            # 생성된 이미지 저장
            output_path = f"uploads/generated_{uuid.uuid4().hex[:8]}.png"
            generated_image[0].save(output_path)
            
            return output_path
            
        except Exception as e:
            print(f"❌ AI generation failed: {e}")
            return None
        """
    
    def _create_prompt_from_furniture(self, furniture_info, original_image_path=None):
        """가구 배치 정보로부터 AI 프롬프트 생성"""
        furniture_names = [item['name'] for item in furniture_info]
        furniture_count = {}
        
        # 가구 개수 계산
        for name in furniture_names:
            furniture_count[name] = furniture_count.get(name, 0) + 1
        
        # 프롬프트 구성
        furniture_descriptions = []
        for name, count in furniture_count.items():
            if count > 1:
                furniture_descriptions.append(f"{count}개의 {name}")
            else:
                furniture_descriptions.append(f"{name}")
        
        base_prompt = "realistic interior design"
        if original_image_path and "floor" in original_image_path.lower():
            base_prompt = "architectural floor plan with furniture layout"
        
        furniture_text = ", ".join(furniture_descriptions)
        prompt = f"{base_prompt}, featuring {furniture_text}, modern style, clean and organized space, high quality, detailed"
        
        print(f"🎨 Generated prompt: {prompt}")
        return prompt
    
    def _mock_generate_interior(self, canvas_data, furniture_info, prompt):
        """
        모의 AI 생성 함수 - 실제 하드웨어가 준비되기 전까지 사용
        캔버스에 생성 결과 오버레이를 추가한 이미지 생성
        """
        try:
            import uuid
            
            # 캔버스 이미지 디코딩
            if canvas_data.startswith('data:image'):
                image_data = canvas_data.split(',')[1]
                decoded_image = base64.b64decode(image_data)
                canvas_image = Image.open(io.BytesIO(decoded_image))
            else:
                canvas_image = Image.open(canvas_data)
            
            # 새로운 이미지 생성 (캔버스 기반)
            generated_image = canvas_image.copy()
            draw = ImageDraw.Draw(generated_image)
            
            # AI 생성 효과 시뮬레이션 (오버레이 추가)
            width, height = generated_image.size
            
            # 반투명 오버레이로 "AI 생성됨" 효과
            overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
            overlay_draw = ImageDraw.Draw(overlay)
            
            # 가구 영역에 스타일 효과 추가
            for item in furniture_info:
                x, y, w, h = int(item['x']), int(item['y']), int(item['width']), int(item['height'])
                
                # 가구 영역에 미묘한 그라디언트/텍스처 효과
                overlay_draw.rectangle(
                    [x, y, x + w, y + h],
                    fill=(100, 150, 200, 30),  # 반투명 파란색
                    outline=(50, 100, 150, 80),
                    width=2
                )
            
            # 오버레이 합성
            generated_image = Image.alpha_composite(
                generated_image.convert('RGBA'), 
                overlay
            ).convert('RGB')
            
            # "AI Generated" 워터마크 추가
            try:
                # 기본 폰트 사용
                font_size = min(width, height) // 20
                font = ImageFont.load_default()
            except:
                font = None
            
            watermark_text = "🤖 AI Generated Interior"
            if font:
                draw = ImageDraw.Draw(generated_image)
                draw.text(
                    (10, height - 30), 
                    watermark_text, 
                    fill=(100, 100, 100, 200), 
                    font=font
                )
            
            # 생성된 이미지 저장
            output_filename = f"generated_{uuid.uuid4().hex[:8]}.png"
            output_path = os.path.join("uploads", output_filename)
            generated_image.save(output_path)
            
            print(f"✅ Mock AI generation completed: {output_path}")
            return output_filename
            
        except Exception as e:
            print(f"❌ Mock generation failed: {e}")
            return None

# 전역 SANA AI 매니저 인스턴스
sana_ai = SanaAIManager()