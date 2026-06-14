from matplotlib import font_manager
import matplotlib as mpl, os, logging
logging.getLogger('matplotlib.font_manager').setLevel(logging.ERROR)

def setup_font():
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                        '../../assets/fonts/LXGWWenKaiMono-Medium.ttf')
    font_manager.fontManager.addfont(path)
    prop = font_manager.FontProperties(fname=path)
    mpl.rcParams['font.family'] = prop.get_name()
    mpl.rcParams['axes.unicode_minus'] = False
