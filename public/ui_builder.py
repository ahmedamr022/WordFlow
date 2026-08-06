import sys
import os
from PyQt5.QtWidgets import (QApplication, QMainWindow, QWidget, QHBoxLayout, 
                             QVBoxLayout, QLabel, QSlider, QComboBox, 
                             QGroupBox, QFormLayout, QScrollArea, QPushButton, 
                             QColorDialog, QLineEdit, QMessageBox, QTabWidget)
from PyQt5.QtCore import Qt, QUrl
from PyQt5.QtGui import QColor
from PyQt5.QtWebEngineWidgets import QWebEngineView

class AdvancedUIStudio(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("🎨 Advanced UI Design Studio - WordFlow Builder")
        self.resize(1650, 950)

        # ---------- القيم الافتراضية للـ State ----------
        # Layout & Position
        self.card_pos = "left"
        self.container_padding_x = 40
        self.container_padding_y = 25
        self.gap_between_sections = 40

        # Login Card Props
        self.card_width = 380
        self.card_height = 88
        self.card_radius = 16
        self.card_opacity = 92
        self.card_bg_color = "#090d18"
        self.card_gradient_start = "#3b82f6"
        self.card_gradient_mid = "#a855f7"
        self.card_gradient_end = "#ec4899"

        # Background Image & Overlay
        self.bg_size = "cover"
        self.bg_pos_x = 50
        self.bg_pos_y = 50
        self.overlay_opacity = 35

        # Typography & Main Content
        self.main_title_text = "اقرأ أكثر...\nوتحدث بثقة."
        self.title_size = 42
        self.subtitle_text = "قصص ملهمة، تعلم ذكي، تقدم مستمر"
        self.subtitle_size = 16
        self.subtitle_color = "#94a3b8"
        
        # --- Features Grid & Cards Props (التحكم الشامل في الكروت الثلاثة) ---
        self.grid_max_width = 720      # أقصى عرض لمجموعة الكروت
        self.grid_gap = 15             # البعد بين الكروت الثلاثة
        self.grid_offset_x = 0         # إزاحة المجموعة أفقياً
        self.grid_offset_y = 0         # إزاحة المجموعة رأسياً
        self.grid_text_align = "center"# محاذاة الكلمات داخل الكروت (center, right, left)

        # خصائص الكارت الفردي (تطبق على الـ 3 كروت معاً)
        self.feature_card_height = 140 # ارتفاع الكروت الثلاثة
        self.feature_card_opacity = 70
        self.feature_card_radius = 12
        self.feature_card_padding = 15
        self.feature_icon_size = 26
        self.feature_title_size = 15

        # نصوص وألوان الكروت الثلاثة
        self.f1_title = "AI Feedback"
        self.f1_desc = "تغذية راجعة ذكية لتحسين كتابتك ونطقك"
        self.f1_icon_color = "#38bdf8"

        self.f2_title = "Native Audio"
        self.f2_desc = "استمع للنطق الصحيح بجودة عالية"
        self.f2_icon_color = "#a855f7"

        self.f3_title = "+500 Stories"
        self.f3_desc = "مئات القصص في مختلف المستويات"
        self.f3_icon_color = "#f43f5e"

        self.init_ui()

    def init_ui(self):
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        main_layout = QHBoxLayout(main_widget)
        main_layout.setContentsMargins(10, 10, 10, 10)

        # ================= 1. لوحة التحكم الجانبية =================
        control_panel = QWidget()
        control_panel.setFixedWidth(440)
        panel_layout = QVBoxLayout(control_panel)
        panel_layout.setContentsMargins(0, 0, 0, 0)

        tabs = QTabWidget()
        
        # --- Tab 1: Layout & Background ---
        tab_layout = QWidget()
        tab_layout_box = QVBoxLayout(tab_layout)
        
        bg_group = QGroupBox("🖼️ الخلفية والصورة")
        bg_form = QFormLayout()
        
        self.bg_mode_combo = QComboBox()
        self.bg_mode_combo.addItems(["cover", "contain", "100% 100%", "auto"])
        self.bg_mode_combo.currentTextChanged.connect(self.set_bg_mode)

        self.bg_x_slider = self.create_slider(0, 100, self.bg_pos_x, self.set_bg_x)
        self.bg_y_slider = self.create_slider(0, 100, self.bg_pos_y, self.set_bg_y)
        self.overlay_slider = self.create_slider(0, 100, self.overlay_opacity, self.set_overlay_opacity)

        bg_form.addRow("نمط الصورة (Size):", self.bg_mode_combo)
        bg_form.addRow("موقع أفقي X (%):", self.bg_x_slider)
        bg_form.addRow("موقع رأسي Y (%):", self.bg_y_slider)
        bg_form.addRow("تعتيم الخلفية (%):", self.overlay_slider)
        bg_group.setLayout(bg_form)

        pos_group = QGroupBox("📐 التوزيع والمواقع العامة")
        pos_form = QFormLayout()

        self.card_pos_combo = QComboBox()
        self.card_pos_combo.addItems(["يسار (Left)", "يمين (Right)"])
        self.card_pos_combo.currentIndexChanged.connect(self.set_card_pos)

        self.pad_x_slider = self.create_slider(10, 100, self.container_padding_x, self.set_pad_x)
        self.pad_y_slider = self.create_slider(10, 80, self.container_padding_y, self.set_pad_y)
        self.gap_slider = self.create_slider(10, 100, self.gap_between_sections, self.set_gap)

        pos_form.addRow("موقع كارت التسجيل:", self.card_pos_combo)
        pos_form.addRow("الهامش الأفقي (px):", self.pad_x_slider)
        pos_form.addRow("الهامش الرأسي (px):", self.pad_y_slider)
        pos_form.addRow("المسافة بين القسمين (px):", self.gap_slider)
        pos_group.setLayout(pos_form)

        tab_layout_box.addWidget(bg_group)
        tab_layout_box.addWidget(pos_group)
        tab_layout_box.addStretch()

        # --- Tab 2: Login Card Customization ---
        tab_card = QWidget()
        tab_card_box = QVBoxLayout(tab_card)

        card_group = QGroupBox("🎴 كارت التسجيل الرئيسي")
        card_form = QFormLayout()

        self.card_w_slider = self.create_slider(280, 650, self.card_width, self.set_card_w)
        self.card_h_slider = self.create_slider(50, 100, self.card_height, self.set_card_h)
        self.card_rad_slider = self.create_slider(0, 40, self.card_radius, self.set_card_rad)
        self.card_op_slider = self.create_slider(10, 100, self.card_opacity, self.set_card_op)

        btn_card_bg = QPushButton("اختيار لون خلفية الكارت")
        btn_card_bg.clicked.connect(self.pick_card_bg)

        card_form.addRow("عرض الكارت (px):", self.card_w_slider)
        card_form.addRow("ارتفاع الكارت (%):", self.card_h_slider)
        card_form.addRow("انحناء الزوايا (Radius):", self.card_rad_slider)
        card_form.addRow("شفافية الكارت (%):", self.card_op_slider)
        card_form.addRow("لون داخل الكارت:", btn_card_bg)
        card_group.setLayout(card_form)

        tab_card_box.addWidget(card_group)
        tab_card_box.addStretch()

        # --- Tab 3: Grid & Features Cards (التحكم الشامل في مكان وأبعاد الكروت الـ 3) ---
        tab_features = QWidget()
        tab_feat_scroll = QScrollArea()
        tab_feat_scroll.setWidgetResizable(True)
        tab_feat_inner = QWidget()
        tab_feat_box = QVBoxLayout(tab_feat_inner)

        # 1. موقع ومسافات الكروت الثلاثة معاً
        grid_pos_group = QGroupBox("📍 تحريك موقع وإبعاد الـ 3 كروت ككتلة واحدة")
        grid_pos_form = QFormLayout()

        self.grid_gap_slider = self.create_slider(0, 60, self.grid_gap, self.set_grid_gap)
        self.grid_off_x_slider = self.create_slider(-200, 200, self.grid_offset_x, self.set_grid_off_x)
        self.grid_off_y_slider = self.create_slider(-150, 150, self.grid_offset_y, self.set_grid_off_y)
        
        self.text_align_combo = QComboBox()
        self.text_align_combo.addItems(["منتصف (Center)", "يمين (Right)", "يسار (Left)"])
        self.text_align_combo.currentIndexChanged.connect(self.set_text_align)

        grid_pos_form.addRow("المسافة بين الكروت 3 (Gap):", self.grid_gap_slider)
        grid_pos_form.addRow("تحريك أفقي X (يمين/يسار):", self.grid_off_x_slider)
        grid_pos_form.addRow("تحريك رأسي Y (فوق/تحت):", self.grid_off_y_slider)
        grid_pos_form.addRow("محاذاة الكلمات والأيقونة:", self.text_align_combo)
        grid_pos_group.setLayout(grid_pos_form)

        # 2. أبعاد وتنسيق الكروت
        grid_dim_group = QGroupBox("📏 العرض والارتفاع والشكل (للـ 3 كروت)")
        grid_dim_form = QFormLayout()

        self.grid_w_slider = self.create_slider(400, 1000, self.grid_max_width, self.set_grid_w)
        self.card_h_feat_slider = self.create_slider(80, 300, self.feature_card_height, self.set_feat_h)
        self.feat_op_slider = self.create_slider(10, 100, self.feature_card_opacity, self.set_feat_op)
        self.feat_rad_slider = self.create_slider(0, 30, self.feature_card_radius, self.set_feat_rad)
        self.feat_pad_slider = self.create_slider(5, 40, self.feature_card_padding, self.set_feat_pad)
        self.feat_icon_sz_slider = self.create_slider(16, 50, self.feature_icon_size, self.set_feat_icon_sz)
        self.feat_title_sz_slider = self.create_slider(11, 24, self.feature_title_size, self.set_feat_title_sz)

        grid_dim_form.addRow("العرض الإجمالي للمجموعة (px):", self.grid_w_slider)
        grid_dim_form.addRow("ارتفاع الكروت الثلاثة (px):", self.card_h_feat_slider)
        grid_dim_form.addRow("شفافية الكروت (%):", self.feat_op_slider)
        grid_dim_form.addRow("انحناء الزوايا (Radius):", self.feat_rad_slider)
        grid_dim_form.addRow("الحشو الداخلي (Padding):", self.feat_pad_slider)
        grid_dim_form.addRow("حجم الأيقونة (px):", self.feat_icon_sz_slider)
        grid_dim_form.addRow("حجم عنوان الكارت (px):", self.feat_title_sz_slider)
        grid_dim_group.setLayout(grid_dim_form)

        # 3. تعديل النصوص والألوان
        f_texts_group = QGroupBox("📝 تعديل النصوص والألوان")
        f_texts_form = QFormLayout()

        self.f1_t_in = QLineEdit(self.f1_title)
        self.f1_t_in.textChanged.connect(lambda t: self.set_f_text(1, 'title', t))
        self.f1_d_in = QLineEdit(self.f1_desc)
        self.f1_d_in.textChanged.connect(lambda t: self.set_f_text(1, 'desc', t))
        btn_f1_c = QPushButton("لون أيقونة 1")
        btn_f1_c.clicked.connect(lambda: self.pick_icon_color(1))

        self.f2_t_in = QLineEdit(self.f2_title)
        self.f2_t_in.textChanged.connect(lambda t: self.set_f_text(2, 'title', t))
        self.f2_d_in = QLineEdit(self.f2_desc)
        self.f2_d_in.textChanged.connect(lambda t: self.set_f_text(2, 'desc', t))
        btn_f2_c = QPushButton("لون أيقونة 2")
        btn_f2_c.clicked.connect(lambda: self.pick_icon_color(2))

        self.f3_t_in = QLineEdit(self.f3_title)
        self.f3_t_in.textChanged.connect(lambda t: self.set_f_text(3, 'title', t))
        self.f3_d_in = QLineEdit(self.f3_desc)
        self.f3_d_in.textChanged.connect(lambda t: self.set_f_text(3, 'desc', t))
        btn_f3_c = QPushButton("لون أيقونة 3")
        btn_f3_c.clicked.connect(lambda: self.pick_icon_color(3))

        f_texts_form.addRow("عنوان 1:", self.f1_t_in)
        f_texts_form.addRow("وصف 1:", self.f1_d_in)
        f_texts_form.addRow("لون 1:", btn_f1_c)
        f_texts_form.addRow("---", QLabel(""))
        f_texts_form.addRow("عنوان 2:", self.f2_t_in)
        f_texts_form.addRow("وصف 2:", self.f2_d_in)
        f_texts_form.addRow("لون 2:", btn_f2_c)
        f_texts_form.addRow("---", QLabel(""))
        f_texts_form.addRow("عنوان 3:", self.f3_t_in)
        f_texts_form.addRow("وصف 3:", self.f3_d_in)
        f_texts_form.addRow("لون 3:", btn_f3_c)
        f_texts_group.setLayout(f_texts_form)

        tab_feat_box.addWidget(grid_pos_group)
        tab_feat_box.addWidget(grid_dim_group)
        tab_feat_box.addWidget(f_texts_group)
        tab_feat_box.addStretch()
        
        tab_feat_scroll.setWidget(tab_feat_inner)
        tab_feat_layout = QVBoxLayout(tab_features)
        tab_feat_layout.setContentsMargins(0, 0, 0, 0)
        tab_feat_layout.addWidget(tab_feat_scroll)

        # --- Tab 4: Typography & Content ---
        tab_text = QWidget()
        tab_text_box = QVBoxLayout(tab_text)

        text_group = QGroupBox("✍️ النصوص والخطوط الرئيسية")
        text_form = QFormLayout()

        self.title_input = QLineEdit(self.main_title_text)
        self.title_input.textChanged.connect(self.set_title_text)
        self.title_size_slider = self.create_slider(20, 60, self.title_size, self.set_title_size)

        self.subtitle_input = QLineEdit(self.subtitle_text)
        self.subtitle_input.textChanged.connect(self.set_subtitle_text)
        self.subtitle_size_slider = self.create_slider(12, 28, self.subtitle_size, self.set_subtitle_size)

        text_form.addRow("العنوان الرئيسي:", self.title_input)
        text_form.addRow("حجم العنوان (px):", self.title_size_slider)
        text_form.addRow("الوصف الفرعي:", self.subtitle_input)
        text_form.addRow("حجم الوصف (px):", self.subtitle_size_slider)
        text_group.setLayout(text_form)

        tab_text_box.addWidget(text_group)
        tab_text_box.addStretch()

        tabs.addTab(tab_layout, "التوزيع")
        tabs.addTab(tab_card, "كارت التسجيل")
        tabs.addTab(tab_features, "الكروت الثلاثة 🎴")
        tabs.addTab(tab_text, "النصوص")

        save_btn = QPushButton("💾 حفظ التصميم النهائي إلى (index.html)")
        save_btn.setStyleSheet("""
            QPushButton {
                background-color: #2563eb; color: white;
                font-weight: bold; font-size: 15px; padding: 14px; border-radius: 8px;
            }
            QPushButton:hover { background-color: #1d4ed8; }
        """)
        save_btn.clicked.connect(self.save_to_html_file)

        panel_layout.addWidget(tabs)
        panel_layout.addWidget(save_btn)

        # ================= 2. شاشة العرض الحية =================
        self.web_view = QWebEngineView()
        main_layout.addWidget(control_panel)
        main_layout.addWidget(self.web_view, stretch=1)

        self.render_html()

    def create_slider(self, min_v, max_v, default_v, callback):
        slider = QSlider(Qt.Horizontal)
        slider.setMinimum(min_v)
        slider.setMaximum(max_v)
        slider.setValue(default_v)
        slider.valueChanged.connect(callback)
        return slider

    # --- Callbacks ---
    def set_bg_mode(self, v): self.bg_size = v; self.render_html()
    def set_bg_x(self, v): self.bg_pos_x = v; self.render_html()
    def set_bg_y(self, v): self.bg_pos_y = v; self.render_html()
    def set_overlay_opacity(self, v): self.overlay_opacity = v; self.render_html()

    def set_card_pos(self, idx): self.card_pos = "left" if idx == 0 else "right"; self.render_html()
    def set_pad_x(self, v): self.container_padding_x = v; self.render_html()
    def set_pad_y(self, v): self.container_padding_y = v; self.render_html()
    def set_gap(self, v): self.gap_between_sections = v; self.render_html()

    def set_card_w(self, v): self.card_width = v; self.render_html()
    def set_card_h(self, v): self.card_height = v; self.render_html()
    def set_card_rad(self, v): self.card_radius = v; self.render_html()
    def set_card_op(self, v): self.card_opacity = v; self.render_html()

    def pick_card_bg(self):
        color = QColorDialog.getColor(QColor(self.card_bg_color), self, "اختر لون الكارت الداخلي")
        if color.isValid():
            self.card_bg_color = color.name()
            self.render_html()

    # Features Grid Callbacks
    def set_grid_gap(self, v): self.grid_gap = v; self.render_html()
    def set_grid_off_x(self, v): self.grid_offset_x = v; self.render_html()
    def set_grid_off_y(self, v): self.grid_offset_y = v; self.render_html()
    def set_grid_w(self, v): self.grid_max_width = v; self.render_html()
    def set_feat_h(self, v): self.feature_card_height = v; self.render_html()
    
    def set_text_align(self, idx):
        aligns = ["center", "right", "left"]
        self.grid_text_align = aligns[idx]
        self.render_html()

    def set_feat_op(self, v): self.feature_card_opacity = v; self.render_html()
    def set_feat_rad(self, v): self.feature_card_radius = v; self.render_html()
    def set_feat_pad(self, v): self.feature_card_padding = v; self.render_html()
    def set_feat_icon_sz(self, v): self.feature_icon_size = v; self.render_html()
    def set_feat_title_sz(self, v): self.feature_title_size = v; self.render_html()

    def set_f_text(self, card_num, field_type, text):
        if card_num == 1:
            if field_type == 'title': self.f1_title = text
            else: self.f1_desc = text
        elif card_num == 2:
            if field_type == 'title': self.f2_title = text
            else: self.f2_desc = text
        elif card_num == 3:
            if field_type == 'title': self.f3_title = text
            else: self.f3_desc = text
        self.render_html()

    def pick_icon_color(self, card_num):
        default_color = self.f1_icon_color if card_num == 1 else (self.f2_icon_color if card_num == 2 else self.f3_icon_color)
        color = QColorDialog.getColor(QColor(default_color), self, f"اختر لون أيقونة كارت {card_num}")
        if color.isValid():
            if card_num == 1: self.f1_icon_color = color.name()
            elif card_num == 2: self.f2_icon_color = color.name()
            elif card_num == 3: self.f3_icon_color = color.name()
            self.render_html()

    def set_title_text(self, text): self.main_title_text = text; self.render_html()
    def set_title_size(self, v): self.title_size = v; self.render_html()
    def set_subtitle_text(self, text): self.subtitle_text = text; self.render_html()
    def set_subtitle_size(self, v): self.subtitle_size = v; self.render_html()

    # --- مولد كود الـ HTML الديناميكي ---
    def generate_code(self, export_mode=False):
        abs_path = os.path.abspath('images/login.png').replace('\\', '/')
        img_src = "images/login.png" if export_mode else f"file:///{abs_path}"
        flex_dir = "row" if self.card_pos == "left" else "row-reverse"
        formatted_title = self.main_title_text.replace('\n', '<br>')

        return f"""<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WordFlow Login</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; font-family: 'Tajawal', sans-serif; }}
        body {{
            width: 100vw; height: 100vh;
            background-color: #050811;
            background-image: url('{img_src}');
            background-size: {self.bg_size};
            background-position: {self.bg_pos_x}% {self.bg_pos_y}%;
            background-repeat: no-repeat;
            color: #ffffff;
            display: flex; flex-direction: column; justify-content: space-between;
            overflow: hidden; position: relative;
        }}
        body::before {{
            content: ''; position: absolute; top:0; left:0; right:0; bottom:0;
            background: rgba(5, 8, 17, {self.overlay_opacity / 100}); z-index: 1;
        }}
        header {{
            position: relative; z-index: 10; display: flex; justify-content: flex-end;
            padding: {self.container_padding_y}px {self.container_padding_x}px;
        }}
        .lang-btn {{
            background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px); color: #fff; padding: 8px 16px; border-radius: 20px;
            display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 14px;
        }}
        main {{
            position: relative; z-index: 10; display: flex; flex-direction: {flex_dir};
            width: 100%; height: calc(100vh - 130px);
            padding: 0 {self.container_padding_x}px; gap: {self.gap_between_sections}px; align-items: center;
        }}
        .login-card-container {{
            width: {self.card_width}px; height: {self.card_height}%;
            border-radius: {self.card_radius}px; padding: 2px;
            background: linear-gradient(180deg, {self.card_gradient_start} 0%, {self.card_gradient_mid} 50%, {self.card_gradient_end} 100%);
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        }}
        .login-card-inner {{
            width: 100%; height: 100%;
            background: {self.card_bg_color}; opacity: {self.card_opacity / 100};
            backdrop-filter: blur(20px); border-radius: {self.card_radius - 2}px; padding: 25px;
        }}
        .content-section {{
            flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center;
        }}
        .welcome-badge {{ font-size: 18px; color: #e2e8f0; margin-bottom: 12px; }}
        .main-title {{
            font-size: {self.title_size}px; font-weight: 800; line-height: 1.3; margin-bottom: 15px;
        }}
        .subtitle {{ color: {self.subtitle_color}; font-size: {self.subtitle_size}px; margin-bottom: 25px; }}
        .divider-line {{
            width: 160px; height: 3px;
            background: linear-gradient(90deg, #00f2fe, #ec4899);
            border-radius: 3px; margin-bottom: 35px;
        }}
        
        /* --- Grid الكروت الثلاثة --- */
        .features-grid {{
            display: flex; 
            gap: {self.grid_gap}px; 
            width: 100%; 
            max-width: {self.grid_max_width}px;
            transform: translate({self.grid_offset_x}px, {self.grid_offset_y}px);
            transition: all 0.1s ease-out;
        }}
        .feature-card {{
            flex: 1; 
            height: {self.feature_card_height}px;
            background: rgba(13, 18, 30, {self.feature_card_opacity/100});
            border: 1px solid rgba(255, 255, 255, 0.08); 
            border-radius: {self.feature_card_radius}px;
            padding: {self.feature_card_padding}px; 
            backdrop-filter: blur(12px); 
            text-align: {self.grid_text_align};
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: { "center" if self.grid_text_align == "center" else ("flex-start" if self.grid_text_align == "right" else "flex-end") };
            transition: all 0.3s ease;
        }}
        .feature-icon {{ font-size: {self.feature_icon_size}px; margin-bottom: 10px; }}
        .icon-f1 {{ color: {self.f1_icon_color}; }} 
        .icon-f2 {{ color: {self.f2_icon_color}; }} 
        .icon-f3 {{ color: {self.f3_icon_color}; }}
        .feature-title {{ font-size: {self.feature_title_size}px; font-weight: 700; margin-bottom: 6px; font-family: 'Inter', sans-serif; }}
        .feature-desc {{ font-size: 13px; color: #94a3b8; line-height: 1.4; }}
        
        footer {{ position: relative; z-index: 10; display: flex; justify-content: center; padding: 15px 0 20px 0; }}
        .security-badge {{ color: #00f2fe; font-size: 13px; display: flex; gap: 8px; align-items: center; }}
    </style>
</head>
<body>
    <header>
        <div class="lang-btn"><i class="fa-solid fa-globe"></i> العربية <i class="fa-solid fa-chevron-down"></i></div>
    </header>
    <main>
        <div class="login-card-container"><div class="login-card-inner"></div></div>
        <div class="content-section">
            <div class="welcome-badge">مرحباً بك مجدداً 👋</div>
            <h1 class="main-title">{formatted_title}</h1>
            <p class="subtitle">{self.subtitle_text}</p>
            <div class="divider-line"></div>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon icon-f1"><i class="fa-solid fa-brain"></i></div>
                    <div class="feature-title">{self.f1_title}</div>
                    <div class="feature-desc">{self.f1_desc}</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon icon-f2"><i class="fa-solid fa-headphones"></i></div>
                    <div class="feature-title">{self.f2_title}</div>
                    <div class="feature-desc">{self.f2_desc}</div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon icon-f3"><i class="fa-solid fa-book-open"></i></div>
                    <div class="feature-title">{self.f3_title}</div>
                    <div class="feature-desc">{self.f3_desc}</div>
                </div>
            </div>
        </div>
    </main>
    <footer><div class="security-badge"><i class="fa-solid fa-shield-halved"></i> بياناتك آمنة معنا</div></footer>
</body>
</html>"""

    def render_html(self):
        code = self.generate_code(export_mode=False)
        self.web_view.setHtml(code, QUrl.fromLocalFile(os.path.abspath(".")))

    def save_to_html_file(self):
        final_code = self.generate_code(export_mode=True)
        file_path = os.path.abspath("index.html")
        
        try:
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(final_code)
            
            msg = QMessageBox()
            msg.setIcon(QMessageBox.Information)
            msg.setText("تم حفظ التصميم النهائي بكل التعديلات بنجاح!")
            msg.setInformativeText(f"تم تحديث index.html في المسار:\n{file_path}")
            msg.setWindowTitle("تم الحفظ")
            msg.exec_()
        except Exception as e:
            QMessageBox.critical(self, "خطأ", f"تعذر حفظ الملف:\n{str(e)}")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    studio = AdvancedUIStudio()
    studio.show()
    sys.exit(app.exec_())