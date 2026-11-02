from matplotlib import font_manager
import matplotlib as mpl, os, logging
logging.getLogger('matplotlib.font_manager').setLevel(logging.ERROR)

def setup_font():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    # 优先查找 Koishi 共享数据目录中的霞鹜文楷字体
    candidates = [
        os.path.join(base_dir, '../../../../data/fonts/LXGWWenKaiMono-Medium.ttf'),
        os.path.join(base_dir, '../../../../data/fonts/LXGWWenKaiMono-Regular.ttf'),
        os.path.join(base_dir, '../../assets/fonts/LXGWWenKaiMono-Medium.ttf'),
    ]
    font_path = next((p for p in candidates if os.path.isfile(p)), None)
    if font_path:
        font_manager.fontManager.addfont(font_path)
        prop = font_manager.FontProperties(fname=font_path)
        mpl.rcParams['font.family'] = prop.get_name()
    else:
        # 回退到常用中文字体或默认无衬线字体
        mpl.rcParams['font.sans-serif'] = ['LXGW WenKai Mono', 'SimHei', 'Microsoft YaHei', 'DejaVu Sans']
    mpl.rcParams['axes.unicode_minus'] = False
