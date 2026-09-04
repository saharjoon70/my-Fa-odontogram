# 🦷 Vue Odontogram Modul

[![Download](https://img.shields.io/badge/Download-Vue--Odontogram--Modul-blue?style=for-the-badge&logo=github)](https://github.com/ZoliQua/React-Odontogram-Modul/releases)
[![Version](https://img.shields.io/badge/version-2.1.0-green?style=for-the-badge)](https://github.com/ZoliQua/React-Odontogram-Modul)
[![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)](https://github.com/ZoliQua/React-Odontogram-Modul/blob/main/LICENSE)
[![DOI](../src/assets/zenodo.21156787.svg)](https://doi.org/10.5281/zenodo.21156787)

[![Vue](https://img.shields.io/badge/Vue-3-4FC08D?style=for-the-badge&logo=vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

> 🌐 **Languages:**  🇬🇧 [English](../README.md#-english) | 🇪🇸 [Español](../README.md#-español) | 🇩🇪 [Deutsch](README-de.md) | 🇭🇺 [Magyar](README-hu.md) | 🇮🇹 [Italiano](README-it.md) | 🇸🇰 [Slovenčina](README-sk.md) | 🇵🇱 [Polski](README-pl.md) | 🇷🇺 [Русский](README-ru.md) | 🇧🇷 [Português (BR)](README-pt-br.md) | 🇸🇦 [العربية](README-ar.md)

---

## 🇸🇦 العربية

### 📋 نظرة عامة
هذا المشروع محرّر تفاعلي لمخطط الأسنان (odontogram) يعمل في المتصفّح، ويُسرّع توثيق الحالة السنية بواجهة نظيفة. يعرض قوالب SVG متعدّدة الطبقات لتمثيل الترميمات والتسوّس والحالة السنية اللّبية والحركة وغيرها من التفاصيل السريرية، مع دعم التحديد المتعدّد ومرشّحات الاختيار وإعدادات حالة مسبقة الجاهزة.

---
<img width="1728" height="922" alt="react-odontogram-modul-arabic-preview" src="https://github.com/user-attachments/assets/0d6e076e-a840-408c-93cc-974e0767aaaf" />

🔗 **رابط التجربة:** https://react-odontogram-modul.vercel.app/

---

### ✨ الميزات الرئيسية
- 🖱️ تحديد سريع وتحديد متعدّد (CMD/CTRL + نقر)
- 🦷 أنواع الأسنان: دائمة، لبنية (لبنية)، زرعة، تحت اللثة، مفقودة
- 🦷 الركيزة السنية (orthogonal لأي ترميم): طبيعية، بقايا جذر (radix)، مكسورة، مُهيّأة للتاج
- 👑 الترميمات حسب النوع × المادة: تاج / inlay / onlay / veneer / جسر من e.max، ذهب، gradia، zircon، معدن، معدن-خزف، تلسكوبي، أو مؤقت (onlay متاح فقط في المنظر الإطباقي) — تُختار من قائمة منسدلة موحّدة بخطوات قليلة «Fix: تاج – …»؛ التاجات `metal` القديمة تُرحَّل تلقائياً إلى `metal-ceramic` (معدن-خزف)؛ تستخدم الزرعات نفس نموذج النوع × المادة، مُركَّبة مع طبقة موصّل الزرعة. تُصفَّى القائمة حسب نوع السن: الزرعة تعرض تاج/جسر فقط (بالإضافة إلى خمس خيارات تثبيت أدناه)؛ السن المفقود/الفراغ يعرض pontic جسر فقط (بالإضافة إلى طقم جزئي/كلي)؛ ركيزة `radix` تُخفي عنصر الترميم بالكامل (لا يمكن توثيق ترميم على بقايا جذر)
- 🦿 الطقم القابل للإزالة/التثبيت على محور `prosthesis` المخصّص (مداخل «Kivehető:» في القائمة الموحّدة): healing abutment، locator، locator مع overdenture، bar، bar مع overdenture؛ طقم جزئي أو كلي قابل للإزالة مدعوم بالأسنان
- 🌉 أسنان الجسر تعرض غطاء التاج وموصّل الفتحة (saddle)؛ يعرض overlay جسر متعدّد الأسنان موصّلاً واحداً متصلاً حسّاساً للقوس على طول أسنان الجسر المتتالية (pontics + أعمدة) والفراغات بينها (الفك العلوي والسفلي يستخدمان هندسة فتحة mirrored، مع الحفاظ على مواءمة الموصّل في كلا الفكين)، ويُضمَّن في تصدير PNG/JPG/SVG؛ تطبيق جسر عبر preset من Statuses يعيد حساب الـ overlay فوراً
- 🔍 توثيق التسوّس على 6 أسطح: mesial، distal، buccal، lingual، occlusal، subcrown
- 🪥 مواد الترميم حسب السطح: amalgam، composite، GIC، مؤقت
- 🏥 قائمة موحّدة «حالة اللّب/العلاج اللّبي» (مجمّعة: لب حي مقابل مُعالَج/endo): الحالات اللّبية (endo-medical-filling، endo-filling، endo-filling-incomplete، endo-glass-pin، endo-metal-pin) وتشخيص اللّب AAE (`pulpDx`: normal / reversible-pulpitis / irreversible-pulpitis / necrosis) متبادلان الاستبعاد — السن المُعالَج لبياً (`endo` مُعرَّف) لا يمكن أن يحمل أيضاً تشخيص لب حي؛ عند المعالجة يُطبَّع `pulpDx` إلى `normal` ويُقمع رمز اللّب المرضي. reversible-pulpitis يعرض رمز لب مخفّض. إعداد اختياري بثلاث مستويات لتفاصيل اللّب (`pulpDetailLevel`: simple / AAE / latin عملي) يعرض 9 أنواع فرعية باللاتين العملي (pulpa sana … gangraena pulpae) عبر `pulpLatin`؛ الاستئصال والدبوس parapulpar يبقيان مؤشرين خاصّين منفصلين
- 🦴 التشخيص الذروي (`apicalDx`: periodontitis apical symptomatic/asymptomatic، abscess apical acute/chronic، condensing osteitis) يحدّد رمز المنطقة الذروية مباشرة؛ مؤهّل نوع lesion granuloma/cyst يُعرض فقط تحت periodontitis apical symptomatic/asymptomatic (نوع «abscess» المكرّر أُزيل — مغطى بالفعل بالتشخيص الذروي)
- 🩹 بطاقة موحّدة «الجذر وال-periodontium» (قسم قابل للطي واحد للنتائج الجذرية/الذروية واللثوية)
- ⚕️ التعديلات: التهاب ذروي (يُعرض فقط على أسنان مفقودة/أُخذ منها)؛ مخفي على الأسنان الحاضرة حيث `apicalDx` فقط يحدّد الرمز الذروي، وعلى الزرعات حيث `periImplant` يغطي ذلك)، مرض periodontal، درجات الحركة (M1/M2/M3، مخفية على الزرعات)
- 🦷🔩 الحالة حول الزرعة (`periImplant`: `none` / `mucositis` / `peri-implantitis-mild` / `peri-implantitis-moderate` / `peri-implantitis-severe`) — تصنيف World Workshop 2018، يُعرض كقائمة مخصّصة على الزرعات؛ mucositis يعيد استخدام رمز اللثة periodontal، peri-implantitis يضيف طبقة `peri-implant-bone-loss` متدرّجة (شفافية 0.4/0.7/1.0). الزرعات لم تعد تعرض رمز lesion ذروي — التهابها يُعبَّر عبر هذا المحور — وخانات تعديل periodontal تُخفى على الزرعات (تسمية «Peri-implantitis» المرتجلة أُوقفت)
- 🏷️ مؤشرات خاصة: تاج مطلوب، استبدال تاج مطلوب، فراغ مُغلق، خلع مخطّط، fissure sealant، فقدان نقطة تماس
- 👁️ تبديل ظهور المنظر الإطباقي، أضراس العقل، العظم، واللب
- 🔢 12 مرشّح اختيار (الكل، حاضرة، دائمة، لبنية، زرعات، مفقودة، علوية/سفلية، أمامية/أضراس)
- 📊 إعدادات حالة مسبقة (إعادة ضبط، dentition لبنية، مختلطة، edentulous)
- 📦 34 نموذج ترميم مسبق (جسور، أطقم قابلة للإزالة، أطقم على bar مع زرعات)
- 💾 تصدير/استيراد الحالة JSON (إصدار 2.10؛ الاستيراد يقبل أيضاً الإصدارات القديمة 1.4، 2.0، 2.1، 2.2، 2.3، 2.4، 2.5، 2.6، 2.7، 2.8، 2.9 ويُرحّل تلقائياً، مع حالات plugin مخصّصة وملاحظات لكل سن)
- 🔗 تصدير HL7 FHIR R4 (Bundle collection مع Observations لكل سن، ترميز ISO 3950 للأسنان الدائمة، نظام أكواد محلي — تخطيط SNOMED CT مخطّط)
- ✚ واجهة اختيار أسطح على شكل صليب/علامة زائد (B/M/O/D/L) للتسوّس والترميمات
- 🧱 مواد ترميم حسب السطح (ترميمات مختلطة، مثلاً amalgam buccal + composite distal)
- 🖼️ تصدير صورة odontogram بصيغ PNG/JPG/SVG (للتنزيل؛ PNG/JPG مُ rasterized من SVG vector)
- 🦷 التسوّس/التسوّس الثانوي كآلة حالات لكل سطح: سطح carious بلا ترميم يُعرض كتسوّس أولي (شفافية ICDAS متدرّجة)؛ بمجرد وجود ترميم على ذلك السطح يُعرض كتسوّس ثانوي (متكرّر) (طبقة `subcaries-{surface}`، مُقيَّم بـ CARS) — لا يكونان نشطين معاً على نفس السطح
- 🎯 شدة موحّدة لكل سطح (`cariesSeverity`، 0–6، تحل محل حقول عمق ICDAS وCARS المنفصلة): تُقرأ كعمق ICDAS على سطح أولي، وكدرجة CARS مسماة (سليم … تجويف واسع) على متكرّر، عبر popup سياقي يعرض المقياس ذا الصلة فقط بحالة السطح الحالية
- 🌱 تسوّس جذري (`rootCaries`: none / active / arrested / active-cavitated)، يفعّل طبقة رسم تسوّس جذري مخصّصة بشفافية حسب الشدة (active 0.5 / arrested 0.7 / active-cavitated شفافية كاملة)
- 📡 عمق إشعاعي للتسوّس (`radiographicDepth`: none / E1 / E2 / D1 / D2 / D3 لكل سطح)، مستقل عن مقياس الشدة البصري ICDAS/CARS، يُعرض كشارة ويُزامَن عبر Observation FHIR خاصّة
- 🎚️ ثلاث إعدادات granular للتسوّس (`secondaryCariesMode`، `rootCariesMode`، `radiographicDepthMode`) بالإضافة إلى مفتاح `cariesDepthEnabled`، تُبسّط كل مقياس إلى عرض selector أبسط دون فقدان القيمة المخزّنة
- 🩹 سطر ملخص subcaries في لوحة الترميمات: يسرد، تحت عناصر الترميم، أي سن محدّد بتسوّس ثانوي وأسطحه (مثلاً «36 (O) لديه subcaries على الترميم.»)
- 🪛 عيوب ترميم حسب السطح (`fillingDefect`: none / marginal / fracture / wear) على ترميمات مباشرة، مستقلة عن التسوّس الثانوي — تُوثَّق عبر مؤشر لكل سطح في بطاقة الترميمات (يعكس مؤشر عمق التسوّس، بقائمة خيارات عمودية)، تُعرض على odontogram وتظهر في tooltip وملخص الترميمات لكامل الفم مع تسمية صريحة (مثلاً «36 (O) – عيب ترميم: O: marginal»)، كما يُوسَم التسوّس الثانوي في سطر Caries؛ بطاقة الترميمات تعرض أيضاً ملاحظة tooltip لأي سن محدّد بعيب ترميم موثّق (مثلاً «السن 36 لديه عيب ترميم موثّق.»)، بالتوازي مع ملاحظة subcaries الموجودة
- 🦷💥 تآكل أسنان مُصنَّف حسب السبب السريري والموقع (`wearEdge`: none / attrition / erosion، incisal/occlusal؛ `wearCervical`: none / abrasion / abfraction / erosion، cervical) — يحل محل مفتاحي تآكل bruxism؛ يُوثَّق عبر قائمتين منسدلتين في صف التآكل، يعيد استخدام رسم التآكل الموجود ويُعرض في tooltip وقسم ملخص جديد «التآكل»
- 🎨 تغيّر لون الأسنان حسب السبب (`discoloration`: none / tetracycline / fluorosis / nonvital / extrinsic / other) على أسنان دائمة ولبنية — يُلوّن fill التاج الطبيعي المعروض بلون تمثيلي عندما لا يوجد ترميم والركيزة طبيعية؛ يُعرض في tooltip وقسم ملخص «تغيّر اللون»؛ يُكمّل مجموعة حالات السطح والهيكلية مع عيوب الترميم والتآكل
- ✏️ الأسنان الأمامية (قاطعة/أنياب) تُسمّي سطحها الإطباقي «incisal» في الواجهة (selector، popup، ملخصات)؛ مفتاح السطح المخزّن يبقى `occlusal`
- 🔤 ترميز سطح حسّاس للموضع (الإعدادات → تفاصيل السن → «ترميز السطح»، simple/full، افتراضي full): في وضع full، حرف ووسم سطح caries/الترميم يتبع تشريح السن — occlusal → I/incisal على أمامي، buccal → L/labial على أمامي، lingual → P/palatal على علوي وL/lingual على سفلي (mesial/distal/subcrown غير متأثرة)؛ الوضع simple يستخدم دائماً مجموعة B/M/O/D/L/SC العامة. ينطبق على ملخص الفم وselectors أسطح caries وعيب الترميم (حرف + تسمية)؛ مفتاح السطح المخزّن غير متأثر
- 🦷↕️ توثيق تقويم لكل سن (`orthoAppliance`: none / bracket / band؛ `orthoDrift`: none / mesial / distal؛ `orthoVertical`: none / extrusion / intrusion؛ `orthoRotation`: boolean) على سن طبيعي حاضر (دائم أو لبنية) — يعيد استخدام رسم تقويم v2.5.0 (بدون SVG جديد)؛ يُعرض على odontogram وtooltip وقسم ملخص «التقويم»
- 🪨 Calculus، وامتصاص جذر مُصنَّف داخلي أو cervical خارجي (`resorptionType`)
- 📏 عمق التسوّس لكل سطح (superficial / dentin / deep)، أو درجة ICDAS II اختيارية (0–6) عبر `enableIcdas`
- 🩹 مفتاح تسرب هامشي للتاج، يُعرض فقط لترميم تاج أو جسر
- 🧰 شريط علوي موحّد للأيقونات مع modal إعدادات بتبويبات (عام / لوحات / تفاصيل السن / caries / لب / ملاحظات — ترقيم، annotations، ظهور اللوحات، ICDAS، مفتاح عمق caries، granular caries جذري/إشعاعي، مستوى تفاصيل اللّب، مستوى تفاصيل التآكل/تغيّر اللون، معلومات السن)
- 🗂️ تبويب الإعدادات → «لوحات»: إظهار/إخفاء مستقل للوحات ملخص Statuses والتقويم
- 🩹 إعدادات caries ثانوي (CARS) موحّدة في تبويب caries، فوق العمق الإشعاعي (تبويب «caries ثانوي» المنفصل أُوقف)
- 🎚️ مستوى تفاصيل تفاصيل السن (الإعدادات → تفاصيل السن): إعداد simple/complex للتآكل وتغيّر اللون. الوضع simple يعرض مفتاح نعم/لا لكل نتيجة (تآكل مفعّل → attrition/abrasion، تغيّر لون → other)؛ الوضع complex (افتراضي) يبقي القوائم الكاملة، والقيمة المخزّنة تُحفظ عند التبديل
- 📋 لوحة معلومات السن: ملخص نصي حيّ لكامل odontogram (عدد الأسنان، قوائم حاضرة/مفقودة، caries incl. ثانوي، ترميمات، علاجات قناة، أطقم، زرعات، حالة periodontal) — معروضة افتراضياً، قابلة للتبديل في الإعدادات
- 🗂️ قائمة تصدير موحّدة (حالة JSON / FHIR / PNG / JPG)
- 📥 قائمة استيراد مع استيراد FHIR (يُعيد استيراد Bundles مُصدَّرة)
- ⏳ overlay تقدّم أثناء تصدير الصور
- 🎓 جولة intro تفاعلية من 12 خطوة
- 🔢 ثلاثة أنظمة ترقيم (FDI، Universal، Palmer)
- 🌐 تعدد اللغات (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR) مع محوّل لغة (190+ مفتاح ترجمة لكل لغة)
- 🌗 دعم الوضع الداكن مع زر تبديل (مستقل أو يتحكّم فيه التطبيق الأب)
- 🎨 إعداد theme مخصّص (prop `themeConfig`) مع CSS variables (`--odon-*`)
- 📱 UX لمس للجوال: popover لمس للتكبير، قائمة سياق بالضغط الطويل، pinch للتكبير، أهداف لمس 44px (WCAG)، تنقّل بتبديل القوس
- 🔌 نظام plugin SVG مخصّص: حقن overlays بصرية، حالة مخصّصة لكل سن، دعم تصدير/استيراد JSON
- ⚠️ تحذيرات التحقق من الحالة للتركيبات غير المتوافقة
- 🏷️ tooltip حالة تلقائي على كتل الأسنان (يعرض كل الحالات النشطة)
- 🩺 tooltip لكل سن ولوحة ملخص الفم محدَّثة: كلاهما يعرض مجموعة النتائج السريرية الكاملة (تشخيص لب/ذروي + نوع lesion، امتصاص جذر، حالة peri-implant، caries جذري متدرّج، calculus، تسرب هامشي تاج، كسر، فقدان تماس، تآكل حافة/cervical مُصنَّف)، مع قسم «التشخيصات» في اللوحة، قسم «التآكل»، ومؤهّل شدة caries مبسّط (superficial/moderate/deep)
- ♿ إمكانية وصول لوحة المفاتيح (WCAG): أدوار ARIA listbox/option، اختيار Enter/Space، تنقّل بالأسهم، focus-visible outlines
- 🔒 وضع read-only: يعطّل كل التفاعلات لحالات الطباعة/التقرير/العرض
- ✨ رسوم تحديد: حد متقطّع نابض وظل متوهّج على الأسنان المحدّدة (مع دعم prefers-reduced-motion)
- 📝 ملاحظات لكل سن: نقرة مزدوجة لإضافة/تعديل، أيقونة ملاحظة بجانب رقم السن، tooltip عند التمرير، تصدير/استيراد JSON
- 🧪 864 اختباراً آلياً ناجحاً (1 اختبار إضافي متجاهل) (Vitest) في 94 ملف اختبار يغطي الترقيم، الترجمات، presets، i18n، مكوّن App، theme، اللمس، plugins، إمكانية الوصول، وparity المحاور السريرية/التشخيصية
- 📖 توثيق API TypeDoc مع تعليقات JSDoc على كل exports عامة (`npm run docs`)

### 📦 الوحدات
- 🦷 شبكة odontogram وواجهة كتل الأسنان
- 🎛️ لوحة التحكم والحالة
- 🎨 محرّك طبقات SVG والقوالب
- 🔢 ترقيم الأسنان وتعيين التسميات (FDI/Universal/Palmer)
- 🌐 التوطين (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR)
- 💾 تصدير/استيراد الحالة
- 📋 status extras: نماذج ترميم مسبقة
- 🎨 إعداد theme: لوحة ألوان قابلة للتخصيص عبر `--odon-*`
- 📱 تفاعلات لمس للجوال (لمس للتكبير، ضغط طويل، pinch، تبديل القوس)
- 🔌 نظام plugin SVG مخصّص
- ⚠️ نظام التحقق من الحالة والـ tooltips
- ♿ إمكانية وصول لوحة المفاتيح وARIA
- 🔒 وضع read-only
- ✨ رسوم التحديد
- 📝 نظام ملاحظات لكل سن
- 🧪 مجموعة اختبارات آلية (Vitest + `@vue/test-utils`)

### 🛠️ عناصر تحكم الواجهة

**🔝 الشريط العلوي:**
- محوّل اللغة (قائمة HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR)
- زر تبديل الوضع الداكن (أيقونة شمس/قمر)
- محوّل نظام الترقيم (FDI/Universal/Palmer)
- أزرار تصدير/استيراد الحالة

**📊 رأس odontogram:**
- تبديل المنظر الإطباقي
- تبديل ظهور أضراس العقل
- تبديل ظهور العظم
- تبديل ظهور اللب
- زر مسح التحديد

**🔍 مرشّحات الاختيار:**
- تحديد الكل / كل الحاضرة / دائمة / لبنية / زرعات / كل المفقودة
- تحديد علوية / 6 أمامية علوية / أضراس علوية
- تحديد سفلية / 6 أمامية سفلية / أضراس سفلية

**📋 إعدادات حالة:**
- إعادة ضبط الكل
- dentition لبنية
- dentition مختلطة
- تبديل edentulous

**📦 قائمة status extras:**
- جسور zircon علوية/سفلية (12-22، 13-23، 16-26، قوس كامل)
- جسور معدنية علوية/سفلية (12-22، 13-23، 16-26، قوس كامل)
- أطقم جزئية قابلة للإزالة علوية/سفلية
- أطقم كاملة قابلة للإزالة علوية/سفلية
- أطقم على bar مع زرعات علوية/سفلية

**🦷 لوحة تحرير السن** (للسن/الأسنان المحدّدة، مجموعة في بطاقات قابلة للطي):
- **صف أساسي:** اختيار السن (نوع أساسي incl. متغيّرات تاج مكسور) وركيزة السن (natural/radix/broken/crownprep)
- **صف الترميم:** القائمة الموحّدة «Fix: …» / «Kivehető: …» (خيارات `restorationType`×`restorationMaterial` ثابتة + خيارات `prosthesis`، مُصفّاة حسب نوع السن)؛ خانة تسرب هامشي تاج (تاج/جسر فقط)؛ خانات موقع تاج مكسور؛ مفاتيح تاج مطلوب / استبدال تاج مطلوب
- **صف التآكل وتغيّر اللون:** قائمة نوع تآكل incisal/occlusal، قائمة تآكل cervical، قائمة سبب تغيّر اللون (كل واحدة تتحول إلى toggle simple في الإعدادات → تفاصيل السن → وضع simple)
- **بطاقة التقويم:** appliance، انحراف mesial/distal، حركة عمودية (extrusion/intrusion)، مفتاح rotation — على سن طبيعي حاضر
- **بطاقة Caries:** قائمة وضع عمق caries، خانة caries subcrown، قائمة شدة caries جذري، selector caries B/M/O/D/L مع popup عمق ICDAS/CARS وشارة عمق إشعاعي
- **بطاقة الترميمات:** قائمة مادة الترميم، selector ترميم حسب السطح (مع مادة لكل سطح)، مؤشر عيب ترميم لكل سطح (marginal/fracture/wear)، ملاحظات tooltip subcaries وعيب الترميم
- **بطاقة الجذر وال-periodontium:** selector موحّد «حالة اللّب/العلاج اللّبي»، selector تشخيص ذروي، selector نوع lesion periapical (periodontitis apical symptomatic/asymptomatic فقط)، selector نوع resorption، selector درجة mobility، selector حالة peri-implant (زرعات فقط)
- **مؤشرات خاصة:** خطة/جرح خلع، فراغ مُغلق، fissure sealing، فقدان نقطة تماس، calculus، دبوس parapulpar، استئصال endo، عمود جسر

### 🦷 أنواع وحالات الأسنان

**اختيار السن (نوع أساسي):**
| القيمة | الوصف |
|---|---|
| `none` | سن مفقود |
| `tooth-base` | سن دائم |
| `milktooth` | سن لبنية |
| `implant` | زرعة سن |
| `tooth-under-gum` | سن تحت اللثة (غير منبث) |

**متغيّرات سن مكسور:**
`tooth-broken-inicisal`, `tooth-broken-distal-inicisal`, `tooth-broken-distal`, `tooth-broken-mesial-distal-inicisal`, `tooth-broken-mesial-distal`, `tooth-broken-mesial-inicisal`, `tooth-broken-mesial`, `no-tooth-after-extraction`

**ركيزة السن (أسنان دائمة):**
`natural` (افتراضي), `radix` (بقايا جذر), `broken`, `crownprep` (مُهيّأ للتاج)

**نوع الترميم (أسنان دائمة):**
`none`, `crown`, `inlay`, `onlay` (منظر إطباقي فقط), `veneer`, `bridge`

**مادة الترميم (أسنان دائمة):**
`none`, `emax`, `gold`, `gradia`, `zircon`, `metal`, `metal-ceramic` (تاجات `metal` القديمة تُرحَّل هنا), `telescope`, `temporary`

**خيارات الترميم مُصفّاة حسب نوع السن** (`restorationOptions()` في `src/registry/restorations.ts`): زرعة تعرض `crown`/`bridge` فقط (مُركّبة مع طبقة موصّل زرعة) + خمس مداخل `prosthesis`؛ سن مفقود/فراغ يعرض pontic `bridge` فقط + مدخلَي طقم قابل للإزالة؛ ركيزة `radix` تُخفي عنصر الترميم. حقول `crownMaterial`/`bridgeUnit` المسطّحة القديمة (قيم تثبيت زرعة/جسر قبل v1.14) أُوقفت من النموذج النشط — تُقبل فقط كمسار ترحيل read-only لـ payloads قديمة.

**Prosthesis** (`prosthesis`؛ محور removable/attachment orthogonal، يُعرض كمداخل «Kivehető:» في قائمة الترميم الموحّدة):
`none`, `healing-abutment`, `locator`, `locator-denture`, `bar`, `bar-denture` (تثبيتات زرعة، مع أو بدون overdenture), `removable-partial`, `removable-full` (أطقم مدعومة بأسنان على سن مفقود/فراغ). السن إما ترميم ثابت أو prosthesis، لا كلاهما — تعيين أحدها يمسح الآخر.

**تسرب هامشي تاج** (`crownLeakage`؛ boolean): يُعرض فقط عندما `restorationType` هو `crown` أو `bridge`؛ يفعّل طبقة `crown-leakage`.

**خيارات endo (أسنان دائمة):**
`none`, `endo-medical-filling`, `endo-filling`, `endo-filling-incomplete`, `endo-glass-pin`, `endo-metal-pin`

**خيارات endo (أسنان لبنية):**
`none`, `endo-medical-filling`

`endo` و`pulpDx` يُعرضان عبر `<select>` موحّد «حالة اللّب/العلاج اللّبي» (مجمّع: لب حي مقابل مُعالَج/endo) ومتبادلان الاستبعاد — اختيار treated (`endo != none`) يُعيد `pulpDx` إلى `normal` واختيار تشخيص لب يُعيد `endo` إلى `none`.

**مواد الترميم (أسنان دائمة):**
`amalgam`, `composite`, `gic`, `temporary`

**مواد الترميم (أسنان لبنية):**
`composite`, `gic`, `temporary`

**أسطح الترميم/caries:**
`mesial`, `distal`, `buccal`, `lingual`, `occlusal`, `subcrown` (caries فقط)

**التعديلات:**
`inflammation` (periapical), `parodontal` (periodontal), `mobility` (M1/M2/M3)

**نوع lesion periapical** (`periapicalType`؛ يُؤهّل الرمز periapical، يُعرض فقط تحت periodontitis apical symptomatic/asymptomatic):
`none`, `granuloma`, `cyst` — خيارات توثيق؛ القيمة القديمة `abscess` ما زالت مقبولة/مخزّنة لكن لم تعد في selector لأنها تكرّر التشخيص الذروي. عند الاستيراد تُدمَج: في `apicalDx` إذا كان السن يحمل modifier inflammation، وإلا تُمسح إلى `none`

**تشخيص اللّب** (مصطلحات AAE؛ `pulpDx`):
`normal`, `reversible-pulpitis` (رمز لب مخفّض), `irreversible-pulpitis`, `necrosis` — متبادل مع `endo`؛ يُطبَّع إلى `normal` على سن مُعالَج endodontically

**تشخيص اللّب، latin عملي** (`pulpLatin`؛ selector اللّب فقط عندما `pulpDetailLevel` هو `latin`):
`none`, `pulpa-sana`, `hyperaemia-pulpae`, `pulpitis-acuta-serosa`, `pulpitis-acuta-purulenta`, `pulpitis-chronica-clausa`, `pulpitis-chronica-ulcerosa`, `pulpitis-chronica-hyperplastica`, `necrosis-pulpae`, `gangraena-pulpae`

**مستوى تفاصيل اللّب** (`pulpDetailLevel`، إعداد عام): `simple`, `aae` (افتراضي), `latin` — يتحكّم في مفردات selector اللّب

**تشخيص ذروي** (`apicalDx`؛ يحدّد الرمز periapical):
`normal`, `symptomatic-apical-periodontitis`, `asymptomatic-apical-periodontitis`, `acute-apical-abscess`, `chronic-apical-abscess`, `condensing-osteitis`

**نوع resorption جذر** (`resorptionType`):
`none`, `internal`, `external-cervical`

**حالة peri-implant** (`periImplant`؛ زرعة فقط، World Workshop 2018): `mucositis` يعيد رمز لثة periodontal؛ `peri-implantitis-*` يضيف طبقة `peri-implant-bone-loss` بشفافية حسب الشدة (خفيف 0.4 / متوسط 0.7 / شديد 1.0). الزرعات لم تعد تعرض رمز lesion periapical (التهابها عبر هذا المحور)، وخانات `mods` inflammation/periodontal مخفية على الزرعات:
`none`, `mucositis`, `peri-implantitis-mild`, `peri-implantitis-moderate`, `peri-implantitis-severe`

**شدة caries** (`cariesSeverity`؛ حقل موحّد لكل سطح، `0`–`6`): على سطح بلا ترميم، يُقرأ كمقياس عمق ICDAS (`superficial` / `dentin` / `deep`، أو رموز ICDAS II `0–6` عند `enableIcdas`) ويعرض طبقة أولية `caries-{surface}`؛ على سطح بترميم، يُقرأ كدرجة CARS مسماة (`0` سليم … `6` تجويف واسع) ويعرض `subcaries-{surface}` (ثانوي) — لا يكون أولي ومتكرّر معاً

**Caries جذري** (`rootCaries`؛ يفعّل طبقة `caries-root` على سن حاضر، شفافية حسب الشدة — `active` 0.5 / `arrested` 0.7 / `active-cavitated` كاملة):
`none`, `active`, `arrested`, `active-cavitated`

**عمق إشعاعي caries** (`radiographicDepth`؛ لكل سطح، مستقل عن `cariesSeverity` ICDAS/CARS):
`none`, `E1`, `E2`, `D1`, `D2`, `D3`

**إعدادات granular caries** (عامة): `secondaryCariesMode` (`simple`/`standard`/`full`، افتراضي `standard`)، `rootCariesMode` (`simple`/`severity`، افتراضي `simple`)، `radiographicDepthMode` (`off`/`threeLevel`/`detailed`، افتراضي `off`)، `cariesDepthEnabled` (boolean، افتراضي `true`) — كل واحد يُبسّط مقياسه دون تغيير القيمة المخزّنة

**مؤشرات خاصة:**
`crownNeeded`, `crownReplace`, `missingClosed`, `extractionPlan`, `extractionWound`, `bridgePillar`, `fissureSealing`, `contactMesial`, `contactDistal`, `endoResection`, `calculus`, `parapulpalPin`

**تآكل أسنان** (`wearEdge`, `wearCervical`؛ نوع سريري حسب الموقع، مُصفّى: tooth-base + بلا ترميم + ركيزة natural؛ يعرض `tooth-bruxism-wear`/`tooth-bruxism-neck-wear`):
`wearEdge`: `none`, `attrition`, `erosion` — `wearCervical`: `none`, `abrasion`, `abfraction`, `erosion`

**Discoloration** (`discoloration`؛ سبب لكل سن، tooth-base طبيعي أو لبنية + بلا ترميم + natural؛ يلوّن fill التاج — بدون SVG جديد):
`none`, `tetracycline`, `fluorosis`, `nonvital`, `extrinsic`, `other`

**عيب ترميم** (`fillingDefect`؛ لكل سطح، نتيجة ترميم مباشر مستقلة عن caries ثانوي — على أسطح في `fillingSurfaceMaterials`؛ طبقة `defect-{surface}`):
`none`, `marginal`, `fracture`, `wear`

**تقويم** (`orthoAppliance`, `orthoDrift`, `orthoVertical`, `orthoRotation`؛ لكل سن، سن طبيعي حاضر — دائم أو لبنية):
`orthoAppliance`: `none`, `bracket`, `band` — `orthoDrift`: `none`, `mesial`, `distal` — `orthoVertical`: `none`, `extrusion` (سهم لأعلى), `intrusion` (سهم لأسفل) — `orthoRotation`: boolean

**إعدادات تفاصيل/تريز السن** (جلسة عامة، الإعدادات → تفاصيل السن): `wearDetailLevel` و`discolorationDetailLevel` (`ToothDetailLevel`: `simple`/`complex`، افتراضي `complex` — simple يعرض toggle نعم/لا بدل القائمة الكاملة دون تغيير القيمة) و`surfaceNotation` (`simple`/`full`، افتراضي `full` — انظر «تريز سطح حسّاس للموضع» أعلاه)

### ⚙️ الإعدادات
تُفتح من أيقونة الترس في الشريط العلوي؛ حوار ARIA `dialog` مع focus trap وتخطيط بتبويبات (Esc/نقر خارج للإغلاق، أسهم للتبويب). كل الإعدادات حالة UI للجلسة فقط ما لم يُذكر خلاف ذلك — لا تغيّر بيانات السن أو payload التصدير.

- **عام:** نظام الترقيم (FDI/Universal/Palmer)، اللغة، theme فاتح/داكن، ظهور لوحة معلومات السن
- **لوحات:** إظهار/إخفاء بطاقة Statuses وبطاقة التقويم (كلاهما ظاهر افتراضياً)
- **تفاصيل السن:** مستوى تفاصيل التآكل وتغيّر اللون (simple/complex، افتراضي complex)، تريز السطح (simple/full، افتراضي full)
- **Caries:** مفتاح ICDAS II (`enableIcdas`)، مفتاح عمق caries (`cariesDepthEnabled`)، granular caries جذري (`rootCariesMode`: simple/severity)، ثانوي/CARS (`secondaryCariesMode`: simple/standard/full)، عمق إشعاعي (`radiographicDepthMode`: off/threeLevel/detailed) — تبويب «caries ثانوي» المنفصل دُمج هنا، CARS فوق العمق الإشعاعي
- **لب:** مستوى تفاصيل اللّب (`pulpDetailLevel`: simple/AAE/latin عملي، افتراضي AAE) — يتحكّم في مفردات selector «حالة اللّب/العلاج اللّبي»؛ تغييره يحدّث ملخص الفم وكل tooltips مباشرة
- **ملاحظات:** تفعيل/تعطيل ملاحظات السن (`enableNotes`)

### 🖼️ نظام قوالب SVG

**قوالب الأسنان** (في `src/assets/teeth-svgs/`):
| القالب | الأسنان |
|---|---|
| `11.svg` | 11, 12, 21, 22, 31, 32, 41, 42 (قاطعات) |
| `13.svg` | 13, 23, 33, 43 (أنياب) |
| `14.svg` / `14_occl.svg` | 14, 15, 24, 25, 34, 35, 44, 45 (الضواحك) |
| `16.svg` / `16_occl.svg` | 16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48 (أضراس) |

القوالب تُدَار 180° للفك السفلي وتُعكس أفقياً للجانب الأيسر.

**SVGs أيقونات** (في `src/assets/icon-svgs/`):
`icon_8.svg` (أضراس العقل), `icon_gum.svg` (عظم), `icon_no_selection.svg` (مسح), `icon_occl.svg` (منظر إطباقي), `icon_pulp.svg` (لب)

### 🔢 أنظمة الترقيم

**FDI (ISO 3950):** دائمة 11-18, 21-28, 31-38, 41-48. لبنية 51-55, 61-65, 71-75, 81-85.

**Universal (US):** دائمة 1–32. لبنية A–T.

**Palmer (Zsigmondy-Palmer):** ربع + موضع (مثلاً UR-1, LL-5). اللبنية A–E لكل ربع.

### 🚀 الاستخدام
التطوير:
```bash
npm install
npm run dev
```
البناء:
```bash
npm run build
```
معاينة:
```bash
npm run preview
```

### 🔗 التكامل
يمكن تضمين المكوّن في أي تطبيق Vue 3.
مثال:
```vue
<script setup lang="ts">
import OdontogramShell from "./index";
</script>

<template>
  <OdontogramShell
    language="ar"
    @language-change="(l) => console.log(l)"
    numbering-system="FDI"
    @numbering-change="(system) => console.log(system)"
    :dark-mode="false"
    @dark-mode-change="(dark) => console.log(dark)"
  />
</template>
```

**تكامل الوضع الداكن:**
- **وضع مستقل:** اترك prop `dark-mode` — المكوّن يدير theme داخلياً عبر زر الشريط ويضيف/يزيل `.dark` على `<html>`.
- **وضع مُتحكَّم فيه:** مرّر `dark-mode` و`@dark-mode-change` — التطبيق الأب يتحكّم. زر التبديل يظهر ويستدعي `@dark-mode-change`. الأب مسؤول عن `.dark` على `<html>`.

**Theme مخصّص:**
```vue
<OdontogramShell
  :theme-config="{
    colors: {
      accent: '#e74c3c',
      background: '#fafafa',
      text: '#222222',
    },
  }"
/>
```

**تكامل plugin:**
```vue
<script setup lang="ts">
import OdontogramShell, { type OdontogramPlugin, setPluginState } from "./index";

const myPlugin: OdontogramPlugin = {
  id: "implant-brand",
  label: { en: "Implant Brand", hu: "Implantátum márka" },
  layer: "overlay",
  renderSvg: (toothNo, _quadrant, state) => {
    if (!state) return null;
    return `<text x="16" y="60" font-size="6" fill="#3b7bff">${state}</text>`;
  },
};
// تعيين حالة plugin لسن:
setPluginState(11, "implant-brand", "Straumann");
</script>

<template>
  <OdontogramShell :plugins="[myPlugin]" />
</template>
```

### 🧪 الاختبارات
```bash
npm run test           # تشغيل 864 اختباراً (1 إضافي متجاهل)
npm run test:watch     # وضع watch
npm run test:coverage  # تقرير التغطية
```

### 📖 توثيق API
```bash
npm run docs           # يولّد توثيق TypeDoc في docs/
```

### 📡 API عام

**Props المكوّن:**

| Prop | النوع | الافتراضي | الوصف |
|---|---|---|---|
| `language` | `string` | `'hu'` | لغة الواجهة (hu/en/de/es/it/sk/pl/ru/pt-br/ar) |
| `@language-change` | `(lang) => void` | — | callback عند تغيير اللغة |
| `numberingSystem` | `string` | `'FDI'` | نظام الترقيم (FDI/Universal/Palmer) |
| `@numbering-change` | `(system) => void` | — | callback عند تغيير الترقيم |
| `dark-mode` | `boolean` | `undefined` | الوضع الداكن. اتركه للوضع المستقل. |
| `@dark-mode-change` | `(dark) => void` | — | callback عند تبديل الوضع الداكن. مطلوب للوضع المُتحكَّم فيه. |
| `themeConfig` | `OdontogramThemeConfig` | `undefined` | تجاوز ألوان عبر `--odon-*`. |
| `plugins` | `OdontogramPlugin[]` | `undefined` | plugins SVG مخصّصة. |
| `readOnly` | `boolean` | `undefined` | يعطّl كل التفاعلات. للطباعة/التقرير. |
| `enableNotes` | `boolean` | `undefined` | ملاحظات السن. نقرة مزدوجة للتحرير. |

**دوال تصدير للتحكم الخارجي:**

| الدالة | الوصف |
|---|---|
| `initOdontogram()` | يهيئ المحرّك ويعرض كل الأسنان |
| `destroyOdontogram()` | ينظّف المحرّك ويزيل المستمعين |
| `setNumberingSystem(system)` | FDI، Universal، Palmer |
| `clearSelection()` | يلغي تحديد كل الأسنان |
| `setOcclusalVisible(on)` | المنظر الإطباقي |
| `setWisdomVisible(on)` | أضراس العقل |
| `setShowBase(on)` | طبقة العظم |
| `setHealthyPulpVisible(on)` | اللب السليم |
| `registerPlugins(plugins)` | تسجيل plugins |
| `setPluginState(toothNo, pluginId, value)` | حالة plugin لسن |
| `getPluginState(toothNo, pluginId)` | قراءة حالة plugin |
| `getToothStateSummary(toothNo)` | ملخص محليّ لكل الحالات |
| `getOdontogramSummary()` | ملخص نصي منظّم لكامل odontogram |
| `onStateChange(callback)` | اشتراك بتغيّرات الحالة؛ يُرجع unsubscribe |
| `setReadOnly(value)` | read-only |
| `getReadOnly()` | حالة read-only |
| `setNotesEnabled(value)` | ملاحظات السن |
| `getNotesEnabled()` | حالة الملاحظات |
| `setPulpDetailLevel(level)` | مفردات selector اللّب — `"simple"`, `"aae"`, `"latin"` |
| `getPulpDetailLevel()` | مستوى تفاصيل اللّب الحالي |
| `exportFhir(options?)` | Bundle FHIR R4 (JSON). `{ subject }` اختياري |
| `exportImage(format)` | `"png"` أو `"jpg"` |
| `exportSvg()` | SVG vector |
| `importFhirBundle(input)` | استيراد Bundle FHIR R4 |
| `setImportFormat(format)` | `"status"` أو `"fhir"` |
| `startIntroTour()` | جولة intro من 12 خطوة |

### 💾 صيغة تصدير/استيراد الحالة
التصدير ينتج JSON (إصدار `2.10`؛ الاستيراد يقبل `1.4`–`2.9` ويُرحّل) يحتوي:

**حقول عامة:**
- `wisdomVisible` - أضراس العقل
- `showBase` - العظم
- `occlusalVisible` - المنظر الإطباقي
- `showHealthyPulp` - اللب السليم
- `edentulous` - edentulous

**حقول لكل سن (32):**
- `toothSelection` - نوع أساسي
- `toothSubstrate` - ركيزة (natural/radix/broken/crownprep)
- `restorationType` - (none/crown/inlay/onlay/veneer/bridge)
- `restorationMaterial` - (emax/gold/gradia/zircon/metal/metal-ceramic/telescope/temporary)
- `prosthesis` - (none/healing-abutment/locator/locator-denture/bar/bar-denture/removable-partial/removable-full)
- `crownLeakage` - تسرب هامشي، تاج/جسر فقط
- `endo` - endo؛ متبادل مع `pulpDx`
- `mods` - (inflammation, parodontal)
- `caries` - أسطح carious
- `cariesActiveDepth` - عمق ICDAS مؤقت من selector (ليس مخزّناً؛ انظر `cariesSeverity`)
- `rootCaries` - (none/active/arrested/active-cavitated)
- `cariesSeverity` - (0-6): ICDAS أولي، CARS متكرّر
- `radiographicDepth` - (none/E1/E2/D1/D2/D3)
- `fillingMaterial` - مادة
- `fillingSurfaces` - أسطح
- `fillingSurfaceMaterials` - مادة لكل سطح
- `fillingDefect` - (none/marginal/fracture/wear)
- `pulpDx` - AAE
- `pulpLatin` - latin عند `pulpDetailLevel` latin
- `apicalDx` - تشخيص ذروي
- `periapicalType` - (none/granuloma/cyst)
- `resorptionType` - (none/internal/external-cervical)
- `periImplant` - peri-implant، زرعة فقط
- `endoResection` - apicectomy
- `fissureSealing` - fissure sealant
- `calculus` - calculus
- `contactMesial` / `contactDistal` - فقدان تماس
- `wearEdge` - (none/attrition/erosion)
- `wearCervical` - (none/abrasion/abfraction/erosion)
- `discoloration` - (none/tetracycline/fluorosis/nonvital/extrinsic/other)
- `orthoAppliance` - (none/bracket/band)
- `orthoDrift` - (none/mesial/distal)
- `orthoVertical` - (none/extrusion/intrusion)
- `orthoRotation` - rotation
- `brokenMesial`, `brokenIncisal`, `brokenDistal` - كسر
- `extractionWound` - جرح بعد الخلع
- `extractionPlan` - خلع مخطّط
- `parapulpalPin` - parapulpar
- `bridgePillar` - عمود جسر
- `mobility` - (none/m1/m2/m3)
- `crownNeeded` / `crownReplace`
- `missingClosed` - فراغ مُغلق
- `customStates` - plugins
- `note` - ملاحظة نصية (اختياري)

### 📁 هيكل المجلدات
- `src/index.ts` - library entry
- `src/App.vue` - shell، شريط علوي، لغة/ترقيم/داكن/theme/plugin
- `src/odontogram.ts` - محرّك SVG، حالة السن، لمس، plugins
- `src/plugin.ts` - `OdontogramPlugin`, `PluginLayer`, `getQuadrant()`, `LAYER_Z`
- `src/theme.ts` - `OdontogramThemeConfig`, `applyThemeConfig()`
- `src/status_extras.ts` - 34 preset ترميم
- `src/i18n/` - ترجمات (HU/EN/DE/ES/IT/SK/PL/RU/PT-BR/AR)
- `src/utils/numbering.ts` - FDI, Universal, Palmer
- `src/registry/` - محاور سريرية declarative: FHIR، SVG، ترميم، selectors
- `src/fhir/` - FHIR R4: `toFhir.ts`/`fromFhir.ts`
- `src/bridgeOverlay.ts` - overlay جسر متعدّد
- `src/SettingsModal.tsx` - إعدادات بتبويبات
- `src/__tests__/` + `src/registry/__tests__/` - Vitest (864 ناجح، 1 متجاهل، 94 ملف)
- `src/assets/teeth-svgs/` - قوالب SVG (6 ملفات)
- `src/assets/icon-svgs/` - أيقونات (5 ملفات)

### ⚙️ التقنيات
- Vue 3 + Vite + TypeScript
- Tailwind CSS
- طبقات SVG عبر DOM (حالة خارج reactivity Vue)
- i18n خفيف مخصّص
- Vitest + `@vue/test-utils`
- TypeDoc
- alias Vite: `@` → `./src`

### 📝 ملاحظات
- قوالب SVG من `src/assets/teeth-svgs` و`src/assets/icon-svgs` — الاستضافة الثابتة يجب أن تخدم public.
- المحرّك يستخدم حالة داخلية (ليس Vue state) للأداء.
- الأسنان اللبنية مواد أقل (بدون amalgam، بدون endo بpins).
- الزرعات خيارات تاج/عمود مختلفة عن الطبيعية.

### 📖 الاقتباس

إذا استخدمت هذا المكوّن في عملك، اقتبسه.

**هذا الإصدار (v2.1.0):**
> Dul, Z. (2026). *Vue Odontogram Modul* (v2.1.0). Zenodo. https://doi.org/10.5281/zenodo.21156787

**كل الإصدارات (DOI concept):** https://doi.org/10.5281/zenodo.21156787

بيانات الاقتباس machine-readable في [`CITATION.cff`](../CITATION.cff).
