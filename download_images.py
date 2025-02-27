import requests
import os

def download_image(url, filename):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        with open(filename, 'wb') as f:
            f.write(response.content)
        print(f"Successfully downloaded {filename}")
    else:
        print(f"Failed to download {filename}: Status code {response.status_code}")

# 创建目录（如果不存在）
os.makedirs('static/img', exist_ok=True)

# 定义图片URL和本地文件名
images = {
    'welcome.jpg': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e',  # 现代科技感的欢迎图片
    'ai-basics.jpg': 'https://images.unsplash.com/photo-1555255707-c07966088b7b',  # AI和机器学习概念图
    'llm.jpg': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5'  # 代码和数据流概念图
}

# 下载所有图片
for filename, url in images.items():
    filepath = os.path.join('static/img', filename)
    try:
        download_image(url, filepath)
    except Exception as e:
        print(f"Error downloading {filename}: {str(e)}") 