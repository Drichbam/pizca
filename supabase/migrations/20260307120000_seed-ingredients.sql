-- ============================================================
-- Seed: catálogo de ingredientes de repostería (~120 ingredientes)
-- ES / FR / EN + aliases comunes de recetas
-- ON CONFLICT DO NOTHING → seguro de ejecutar múltiples veces
-- ============================================================

INSERT INTO public.ingredients (canonical_name, category, translations, aliases, off_category) VALUES

-- ═══ DAIRY ═══
('butter', 'dairy',
  '{"es":"mantequilla","fr":"beurre","en":"butter"}'::jsonb,
  '{"fr":["beurre doux","beurre pommade","beurre noisette","beurre clarifié","beurre fondu","beurre frais","beurre tempéré"],"es":["manteca","mantequilla pomada","mantequilla en pomada","mantequilla derretida","mantequilla a temperatura ambiente"],"en":["unsalted butter","softened butter","browned butter","clarified butter","melted butter"]}'::jsonb,
  'en:butters'),

('butter-salted', 'dairy',
  '{"es":"mantequilla con sal","fr":"beurre salé","en":"salted butter"}'::jsonb,
  '{"fr":["beurre demi-sel"],"es":["mantequilla salada"]}'::jsonb,
  'en:butters'),

('cream-heavy', 'dairy',
  '{"es":"nata para montar","fr":"crème liquide entière","en":"heavy cream"}'::jsonb,
  '{"fr":["crème entière","crème fleurette","crème liquide","crème à 35%","crème fraîche liquide","crème UHT"],"es":["nata líquida","nata montada","nata 35%","crema de leche","crema para batir"],"en":["whipping cream","double cream","full-fat cream","thickened cream"]}'::jsonb,
  'en:creams'),

('cream-fresh', 'dairy',
  '{"es":"crème fraîche","fr":"crème fraîche","en":"crème fraîche"}'::jsonb,
  '{"fr":["crème fraîche épaisse","crème épaisse"],"es":["crema fresca","crema agria"]}'::jsonb,
  'en:creams'),

('milk-whole', 'dairy',
  '{"es":"leche entera","fr":"lait entier","en":"whole milk"}'::jsonb,
  '{"fr":["lait","lait frais entier","lait demi-écrémé"],"es":["leche","leche fresca","leche de vaca"],"en":["milk","full-fat milk","fresh milk"]}'::jsonb,
  'en:milks'),

('milk-skim', 'dairy',
  '{"es":"leche desnatada","fr":"lait écrémé","en":"skim milk"}'::jsonb,
  '{"fr":["lait 0%","lait maigre"],"es":["leche 0%"],"en":["non-fat milk","fat-free milk"]}'::jsonb,
  'en:milks'),

('mascarpone', 'dairy',
  '{"es":"mascarpone","fr":"mascarpone","en":"mascarpone"}'::jsonb,
  '{"fr":["fromage mascarpone"],"es":["queso mascarpone"]}'::jsonb,
  'en:fresh-cheeses'),

('cream-cheese', 'dairy',
  '{"es":"queso crema","fr":"fromage à la crème","en":"cream cheese"}'::jsonb,
  '{"fr":["Philadelphia","fromage frais","St Môret"],"es":["queso Philadelphia","queso de untar"],"en":["Philadelphia","soft cheese"]}'::jsonb,
  'en:fresh-cheeses'),

('fromage-blanc', 'dairy',
  '{"es":"queso fresco batido","fr":"fromage blanc","en":"fromage blanc"}'::jsonb,
  '{"fr":["fromage blanc 0%","fromage blanc 40%","faisselle","quark"],"es":["quark","fromage blanc"]}'::jsonb,
  'en:fresh-cheeses'),

('ricotta', 'dairy',
  '{"es":"ricota","fr":"ricotta","en":"ricotta"}'::jsonb,
  '{"fr":["ricotta fraîche"],"es":["ricotta"]}'::jsonb,
  'en:fresh-cheeses'),

('condensed-milk', 'dairy',
  '{"es":"leche condensada","fr":"lait concentré sucré","en":"condensed milk"}'::jsonb,
  '{"fr":["lait concentré","lait condensé"],"es":["leche condensada azucarada"],"en":["sweetened condensed milk"]}'::jsonb,
  'en:milks'),

('evaporated-milk', 'dairy',
  '{"es":"leche evaporada","fr":"lait évaporé","en":"evaporated milk"}'::jsonb,
  '{"fr":["lait concentré non sucré"],"es":["leche evaporada sin azúcar"]}'::jsonb,
  'en:milks'),

('yogurt-plain', 'dairy',
  '{"es":"yogur natural","fr":"yaourt nature","en":"plain yogurt"}'::jsonb,
  '{"fr":["yaourt","yaourt grec","yogourt"],"es":["yogur","yogur griego"],"en":["greek yogurt","natural yoghurt"]}'::jsonb,
  'en:yogurts'),

-- ═══ FLOUR ═══
('flour-all-purpose', 'flour',
  '{"es":"harina de trigo","fr":"farine de blé","en":"all-purpose flour"}'::jsonb,
  '{"fr":["farine T45","farine T55","farine blanche","farine pâtissière","farine"],"es":["harina","harina floja","harina 000","harina de repostería"],"en":["plain flour","cake flour","pastry flour","flour"]}'::jsonb,
  'en:flours'),

('flour-bread', 'flour',
  '{"es":"harina de fuerza","fr":"farine de gruau","en":"bread flour"}'::jsonb,
  '{"fr":["farine T65","farine de force","farine forte"],"es":["harina 000","harina manitoba"],"en":["strong flour","high-gluten flour"]}'::jsonb,
  'en:flours'),

('flour-almond', 'flour',
  '{"es":"harina de almendra","fr":"poudre d''amande","en":"almond flour"}'::jsonb,
  '{"fr":["amande en poudre","poudre d''amandes","tant pour tant"],"es":["almendra molida","polvo de almendra"],"en":["ground almond","almond meal","blanched almond flour"]}'::jsonb,
  'en:flours'),

('flour-hazelnut', 'flour',
  '{"es":"harina de avellana","fr":"poudre de noisette","en":"hazelnut flour"}'::jsonb,
  '{"fr":["noisette en poudre","noisettes moulues"],"es":["avellana molida","polvo de avellana"],"en":["ground hazelnut","hazelnut meal"]}'::jsonb,
  'en:flours'),

('flour-pistachio', 'flour',
  '{"es":"harina de pistacho","fr":"poudre de pistache","en":"pistachio flour"}'::jsonb,
  '{"fr":["pistache en poudre","pistaches moulues"],"es":["pistacho molido"]}'::jsonb,
  'en:flours'),

('starch-corn', 'flour',
  '{"es":"maicena","fr":"fécule de maïs","en":"cornstarch"}'::jsonb,
  '{"fr":["amidon de maïs","Maïzena"],"es":["fécula de maíz","almidón de maíz"],"en":["corn flour","Maizena","cornflour"]}'::jsonb,
  'en:starches'),

('starch-potato', 'flour',
  '{"es":"fécula de patata","fr":"fécule de pomme de terre","en":"potato starch"}'::jsonb,
  '{"fr":["fécule"],"es":["almidón de patata"],"en":["potato flour"]}'::jsonb,
  'en:starches'),

('flour-rice', 'flour',
  '{"es":"harina de arroz","fr":"farine de riz","en":"rice flour"}'::jsonb,
  '{"fr":["farine riz"],"es":["almidón de arroz"]}'::jsonb,
  'en:flours'),

('flour-whole-wheat', 'flour',
  '{"es":"harina integral","fr":"farine complète","en":"whole wheat flour"}'::jsonb,
  '{"fr":["farine T110","farine T150","farine intégrale"],"es":["harina de trigo integral"],"en":["wholemeal flour","whole grain flour"]}'::jsonb,
  'en:flours'),

-- ═══ SUGAR ═══
('sugar-white', 'sugar',
  '{"es":"azúcar","fr":"sucre","en":"sugar"}'::jsonb,
  '{"fr":["sucre blanc","sucre semoule","sucre en poudre","sucre cristallisé","sucre fin"],"es":["azúcar blanco","azúcar normal","azúcar refinado","azúcar granulado"],"en":["white sugar","caster sugar","granulated sugar","fine sugar"]}'::jsonb,
  'en:sugars'),

('sugar-powdered', 'sugar',
  '{"es":"azúcar glas","fr":"sucre glace","en":"powdered sugar"}'::jsonb,
  '{"fr":["sucre impalpable","sucre en glace","sucre à glacer","sucre icing"],"es":["azúcar lustre","azúcar en polvo","azúcar impalpable","azúcar flor"],"en":["icing sugar","confectioners sugar","10X sugar"]}'::jsonb,
  'en:sugars'),

('sugar-brown', 'sugar',
  '{"es":"azúcar moreno","fr":"sucre roux","en":"brown sugar"}'::jsonb,
  '{"fr":["cassonade","vergeoise","sucre brun","sucre de canne roux"],"es":["azúcar castaño","azúcar integral","panela"],"en":["light brown sugar","dark brown sugar","soft brown sugar"]}'::jsonb,
  'en:sugars'),

('sugar-muscovado', 'sugar',
  '{"es":"azúcar muscovado","fr":"sucre muscovado","en":"muscovado sugar"}'::jsonb,
  '{"fr":["sucre complet","sucre noir"],"es":["azúcar negro","azúcar integral oscuro"]}'::jsonb,
  'en:sugars'),

('honey', 'sugar',
  '{"es":"miel","fr":"miel","en":"honey"}'::jsonb,
  '{"fr":["miel d''acacia","miel liquide","miel toutes fleurs"],"es":["miel de acacia","miel líquida"],"en":["acacia honey","liquid honey","clear honey"]}'::jsonb,
  'en:honeys'),

('maple-syrup', 'sugar',
  '{"es":"jarabe de arce","fr":"sirop d''érable","en":"maple syrup"}'::jsonb,
  '{"fr":["sirop érable"],"es":["sirope de arce","miel de arce"],"en":["pure maple syrup"]}'::jsonb,
  'en:syrups'),

('glucose-syrup', 'sugar',
  '{"es":"glucosa","fr":"sirop de glucose","en":"glucose syrup"}'::jsonb,
  '{"fr":["glucose","sirop de glucose-fructose","sirop de maïs"],"es":["jarabe de glucosa","glucosa líquida"],"en":["corn syrup","liquid glucose"]}'::jsonb,
  'en:syrups'),

('invert-sugar', 'sugar',
  '{"es":"azúcar invertido","fr":"sucre inverti","en":"invert sugar"}'::jsonb,
  '{"fr":["trimoline","sucre liquide","intervertase"],"es":["trimolina"],"en":["trimoline","invertase"]}'::jsonb,
  'en:sugars'),

('caramel', 'sugar',
  '{"es":"caramelo","fr":"caramel","en":"caramel"}'::jsonb,
  '{"fr":["caramel à sec","caramel liquide","caramel au beurre salé","caramel beurre salé"],"es":["caramelo líquido","caramelo salado","toffee"],"en":["dry caramel","wet caramel","salted caramel"]}'::jsonb,
  'en:sugars'),

-- ═══ FAT ═══
('oil-neutral', 'fat',
  '{"es":"aceite neutro","fr":"huile neutre","en":"neutral oil"}'::jsonb,
  '{"fr":["huile de tournesol","huile de pépins de raisin","huile végétale"],"es":["aceite de girasol","aceite de pepitas de uva","aceite vegetal"],"en":["sunflower oil","vegetable oil","canola oil","grapeseed oil"]}'::jsonb,
  'en:oils'),

('oil-olive', 'fat',
  '{"es":"aceite de oliva","fr":"huile d''olive","en":"olive oil"}'::jsonb,
  '{"fr":["huile d''olive extra vierge","EVOO"],"es":["aceite de oliva virgen extra","AOVE"],"en":["extra virgin olive oil","EVOO"]}'::jsonb,
  'en:olive-oils'),

('cocoa-butter', 'fat',
  '{"es":"manteca de cacao","fr":"beurre de cacao","en":"cocoa butter"}'::jsonb,
  '{"fr":["beurre cacao","mycryo"],"es":["manteca cacao","mycryo"],"en":["cacao butter","mycryo"]}'::jsonb,
  'en:cocoa-and-chocolate'),

('coconut-oil', 'fat',
  '{"es":"aceite de coco","fr":"huile de coco","en":"coconut oil"}'::jsonb,
  '{"fr":["huile de coprah"],"es":["aceite de copra"]}'::jsonb,
  'en:oils'),

-- ═══ EGG ═══
('egg-whole', 'egg',
  '{"es":"huevo","fr":"oeuf","en":"egg"}'::jsonb,
  '{"fr":["oeuf entier","oeufs","oeufs entiers"],"es":["huevos","huevo entero"],"en":["whole egg","eggs"]}'::jsonb,
  'en:eggs'),

('egg-yolk', 'egg',
  '{"es":"yema de huevo","fr":"jaune d''oeuf","en":"egg yolk"}'::jsonb,
  '{"fr":["jaune","jaunes","jaunes d''oeufs"],"es":["yema","yemas"],"en":["yolk","egg yolks"]}'::jsonb,
  'en:eggs'),

('egg-white', 'egg',
  '{"es":"clara de huevo","fr":"blanc d''oeuf","en":"egg white"}'::jsonb,
  '{"fr":["blanc","blancs","blancs d''oeufs","meringue"],"es":["clara","claras"],"en":["whites","egg whites"]}'::jsonb,
  'en:eggs'),

-- ═══ CHOCOLATE ═══
('chocolate-dark', 'chocolate',
  '{"es":"chocolate negro","fr":"chocolat noir","en":"dark chocolate"}'::jsonb,
  '{"fr":["chocolat noir 70%","chocolat noir 64%","chocolat noir 66%","chocolat noir 55%","chocolat fondant","couverture noire","chocolat de couverture"],"es":["chocolate negro 70%","chocolate amargo","cobertura negra","chocolate para fundir"],"en":["bittersweet chocolate","semisweet chocolate","70% chocolate","dark couverture"]}'::jsonb,
  'en:cocoa-and-chocolate'),

('chocolate-milk', 'chocolate',
  '{"es":"chocolate con leche","fr":"chocolat au lait","en":"milk chocolate"}'::jsonb,
  '{"fr":["chocolat lait","couverture lait"],"es":["cobertura con leche"],"en":["milk couverture"]}'::jsonb,
  'en:cocoa-and-chocolate'),

('chocolate-white', 'chocolate',
  '{"es":"chocolate blanco","fr":"chocolat blanc","en":"white chocolate"}'::jsonb,
  '{"fr":["couverture blanche","chocolat blanc ivoire"],"es":["cobertura blanca"],"en":["white couverture","ivory chocolate"]}'::jsonb,
  'en:cocoa-and-chocolate'),

('cocoa-powder', 'chocolate',
  '{"es":"cacao en polvo","fr":"poudre de cacao","en":"cocoa powder"}'::jsonb,
  '{"fr":["cacao non sucré","cacao pur","poudre de cacao non sucrée","cacao alcalinisé","cacao Van Houten"],"es":["cacao puro","cacao amargo","cacao sin azúcar"],"en":["unsweetened cocoa","dutch-process cocoa","raw cacao"]}'::jsonb,
  'en:cocoa-and-chocolate'),

('praline-paste', 'chocolate',
  '{"es":"pasta de praliné","fr":"praliné","en":"praline paste"}'::jsonb,
  '{"fr":["pâte de praliné","praliné noisette","praliné amande","praliné amande-noisette","tant pour tant praliné"],"es":["praliné","pasta pralinada"],"en":["hazelnut praline","almond praline"]}'::jsonb,
  'en:cocoa-and-chocolate'),

('gianduja', 'chocolate',
  '{"es":"gianduia","fr":"gianduja","en":"gianduja"}'::jsonb,
  '{"fr":["chocolat gianduja","gianduja noisette"],"es":["gianduja","chocolate de avellana"]}'::jsonb,
  'en:cocoa-and-chocolate'),

('chocolate-ruby', 'chocolate',
  '{"es":"chocolate rubí","fr":"chocolat rubis","en":"ruby chocolate"}'::jsonb,
  '{"fr":["chocolat ruby","Ruby"],"es":["chocolate ruby"]}'::jsonb,
  'en:cocoa-and-chocolate'),

-- ═══ FRUIT ═══
('strawberry', 'fruit',
  '{"es":"fresa","fr":"fraise","en":"strawberry"}'::jsonb,
  '{"fr":["fraises fraîches","purée de fraise","coulis de fraise"],"es":["fresón","fresas frescas","puré de fresa"],"en":["fresh strawberry","strawberry puree"]}'::jsonb,
  'en:fruits'),

('raspberry', 'fruit',
  '{"es":"frambuesa","fr":"framboise","en":"raspberry"}'::jsonb,
  '{"fr":["framboises fraîches","purée de framboise","coulis de framboise"],"es":["frambuesas frescas","puré de frambuesa"],"en":["fresh raspberry","raspberry puree"]}'::jsonb,
  'en:fruits'),

('blueberry', 'fruit',
  '{"es":"arándano","fr":"myrtille","en":"blueberry"}'::jsonb,
  '{"fr":["myrtilles fraîches","bleuet","airelle"],"es":["arándanos azules","moras"],"en":["fresh blueberry"]}'::jsonb,
  'en:fruits'),

('blackcurrant', 'fruit',
  '{"es":"grosella negra","fr":"cassis","en":"blackcurrant"}'::jsonb,
  '{"fr":["purée de cassis","groseilles noires"],"es":["casis","grosella"]}'::jsonb,
  'en:fruits'),

('cherry', 'fruit',
  '{"es":"cereza","fr":"cerise","en":"cherry"}'::jsonb,
  '{"fr":["cerises fraîches","griottes","cerises amarena"],"es":["cerezas","guinda","cereza ácida"],"en":["sour cherry","amarena cherry","kirsch cherry"]}'::jsonb,
  'en:fruits'),

('apricot', 'fruit',
  '{"es":"albaricoque","fr":"abricot","en":"apricot"}'::jsonb,
  '{"fr":["abricots frais","purée d''abricot","confiture d''abricot","nappage abricot"],"es":["albaricoques","mermelada de albaricoque","brillo de albaricoque"],"en":["apricot jam","apricot glaze","apricot puree"]}'::jsonb,
  'en:fruits'),

('passion-fruit', 'fruit',
  '{"es":"maracuyá","fr":"fruit de la passion","en":"passion fruit"}'::jsonb,
  '{"fr":["purée de passion","maracuja","passion"],"es":["fruta de la pasión","passion fruit","purée de maracuyá"],"en":["passionfruit","passion fruit puree"]}'::jsonb,
  'en:fruits'),

('mango', 'fruit',
  '{"es":"mango","fr":"mangue","en":"mango"}'::jsonb,
  '{"fr":["purée de mangue","mangue fraîche"],"es":["puré de mango","mango fresco"],"en":["mango puree","fresh mango"]}'::jsonb,
  'en:fruits'),

('lemon', 'fruit',
  '{"es":"limón","fr":"citron","en":"lemon"}'::jsonb,
  '{"fr":["jus de citron","zeste de citron","citron jaune"],"es":["zumo de limón","ralladura de limón","jugo de limón"],"en":["lemon juice","lemon zest","fresh lemon"]}'::jsonb,
  'en:citrus'),

('orange', 'fruit',
  '{"es":"naranja","fr":"orange","en":"orange"}'::jsonb,
  '{"fr":["jus d''orange","zeste d''orange","orange fraîche"],"es":["zumo de naranja","ralladura de naranja","jugo de naranja"],"en":["orange juice","orange zest"]}'::jsonb,
  'en:citrus'),

('lime', 'fruit',
  '{"es":"lima","fr":"citron vert","en":"lime"}'::jsonb,
  '{"fr":["jus de citron vert","zeste de citron vert","lime"],"es":["zumo de lima","ralladura de lima","jugo de lima"],"en":["lime juice","lime zest"]}'::jsonb,
  'en:citrus'),

('pear', 'fruit',
  '{"es":"pera","fr":"poire","en":"pear"}'::jsonb,
  '{"fr":["poires fraîches","poire conférence","purée de poire"],"es":["peras frescas"]}'::jsonb,
  'en:fruits'),

('apple', 'fruit',
  '{"es":"manzana","fr":"pomme","en":"apple"}'::jsonb,
  '{"fr":["pommes fraîches","compote de pomme"],"es":["manzanas frescas","compota de manzana"]}'::jsonb,
  'en:fruits'),

('banana', 'fruit',
  '{"es":"plátano","fr":"banane","en":"banana"}'::jsonb,
  '{"fr":["banane fraîche","purée de banane"],"es":["banana","banano","plátano maduro"]}'::jsonb,
  'en:fruits'),

('lemon-juice', 'fruit',
  '{"es":"zumo de limón","fr":"jus de citron","en":"lemon juice"}'::jsonb,
  '{"fr":["jus citron","jus de citron fraîchement pressé"],"es":["jugo de limón","zumo limón"],"en":["fresh lemon juice","squeezed lemon"]}'::jsonb,
  'en:juices'),

('orange-juice', 'fruit',
  '{"es":"zumo de naranja","fr":"jus d''orange","en":"orange juice"}'::jsonb,
  '{"fr":["jus orange","jus d''orange frais"],"es":["jugo de naranja","zumo naranja"]}'::jsonb,
  'en:juices'),

-- ═══ SPICE ═══
('vanilla-pod', 'spice',
  '{"es":"vainilla","fr":"gousse de vanille","en":"vanilla pod"}'::jsonb,
  '{"fr":["vanille","gousses de vanille","vanille Bourbon","graines de vanille","caviar de vanille"],"es":["vaina de vainilla","vainas de vainilla","semillas de vainilla"],"en":["vanilla bean","vanilla seeds","vanilla caviar"]}'::jsonb,
  'en:spices'),

('vanilla-extract', 'spice',
  '{"es":"extracto de vainilla","fr":"extrait de vanille","en":"vanilla extract"}'::jsonb,
  '{"fr":["extrait naturel de vanille","arôme vanille"],"es":["esencia de vainilla","aroma de vainilla"],"en":["vanilla essence","pure vanilla extract"]}'::jsonb,
  'en:spices'),

('vanilla-powder', 'spice',
  '{"es":"vainilla en polvo","fr":"poudre de vanille","en":"vanilla powder"}'::jsonb,
  '{"fr":["vanille en poudre"],"es":["polvo de vainilla"]}'::jsonb,
  'en:spices'),

('cinnamon', 'spice',
  '{"es":"canela","fr":"cannelle","en":"cinnamon"}'::jsonb,
  '{"fr":["cannelle en poudre","cannelle de Ceylan","bâton de cannelle"],"es":["canela en polvo","canela en rama"],"en":["ground cinnamon","cinnamon stick","Ceylon cinnamon"]}'::jsonb,
  'en:spices'),

('tonka-bean', 'spice',
  '{"es":"haba tonka","fr":"fève tonka","en":"tonka bean"}'::jsonb,
  '{"fr":["tonka","fève de tonka"],"es":["tonka","habas tonka"]}'::jsonb,
  'en:spices'),

('cardamom', 'spice',
  '{"es":"cardamomo","fr":"cardamome","en":"cardamom"}'::jsonb,
  '{"fr":["cardamome en poudre","gousses de cardamome"],"es":["cardamomo en polvo"],"en":["ground cardamom","cardamom pods"]}'::jsonb,
  'en:spices'),

('ginger', 'spice',
  '{"es":"jengibre","fr":"gingembre","en":"ginger"}'::jsonb,
  '{"fr":["gingembre en poudre","gingembre frais","gingembre râpé"],"es":["jengibre en polvo","jengibre fresco","jengibre rallado"],"en":["ground ginger","fresh ginger","grated ginger"]}'::jsonb,
  'en:spices'),

('nutmeg', 'spice',
  '{"es":"nuez moscada","fr":"noix de muscade","en":"nutmeg"}'::jsonb,
  '{"fr":["muscade","muscade râpée"],"es":["nuez moscada rallada"],"en":["ground nutmeg","grated nutmeg"]}'::jsonb,
  'en:spices'),

('star-anise', 'spice',
  '{"es":"anís estrellado","fr":"badiane","en":"star anise"}'::jsonb,
  '{"fr":["anis étoilé","badiane de Chine"],"es":["anís","anís chino"]}'::jsonb,
  'en:spices'),

('salt', 'spice',
  '{"es":"sal","fr":"sel","en":"salt"}'::jsonb,
  '{"fr":["sel fin","sel table","fleur de sel","sel de Guérande","sel de mer"],"es":["sal fina","sal de mesa","sal marina","flor de sal"],"en":["fine salt","table salt","sea salt","kosher salt"]}'::jsonb,
  'en:salts'),

('fleur-de-sel', 'spice',
  '{"es":"flor de sal","fr":"fleur de sel","en":"fleur de sel"}'::jsonb,
  '{"fr":["fleur de sel de Guérande","fleur de sel de Noirmoutier"],"es":["sal en escamas","Maldon"],"en":["sea salt flakes","Maldon salt"]}'::jsonb,
  'en:salts'),

('rose-water', 'spice',
  '{"es":"agua de rosas","fr":"eau de rose","en":"rose water"}'::jsonb,
  '{"fr":["eau de rose alimentaire"],"es":["agua de rosa"],"en":["rosewater"]}'::jsonb,
  'en:spices'),

('orange-blossom-water', 'spice',
  '{"es":"agua de azahar","fr":"eau de fleur d''oranger","en":"orange blossom water"}'::jsonb,
  '{"fr":["fleur d''oranger","eau florale d''oranger"],"es":["agua de flor de azahar","esencia de azahar"],"en":["orange flower water"]}'::jsonb,
  'en:spices'),

-- ═══ LEAVENING ═══
('baking-powder', 'leavening',
  '{"es":"levadura química","fr":"levure chimique","en":"baking powder"}'::jsonb,
  '{"fr":["poudre levante","poudre à lever","Royal"],"es":["polvo de hornear","impulsor","Royal"],"en":["double-acting baking powder"]}'::jsonb,
  'en:leavening-agents'),

('baking-soda', 'leavening',
  '{"es":"bicarbonato de sodio","fr":"bicarbonate de soude","en":"baking soda"}'::jsonb,
  '{"fr":["bicarbonate","bicarbonate alimentaire"],"es":["bicarbonato","bicarbonato sódico"],"en":["bicarbonate of soda","sodium bicarbonate"]}'::jsonb,
  'en:leavening-agents'),

('yeast-dry', 'leavening',
  '{"es":"levadura seca","fr":"levure sèche","en":"dry yeast"}'::jsonb,
  '{"fr":["levure de boulanger sèche","levure déshydratée","levure sèche active","levure instantanée","SAF","Briochin"],"es":["levadura de panadero seca","levadura instantánea","levadura deshidratada"],"en":["active dry yeast","instant yeast","fast-action yeast"]}'::jsonb,
  'en:yeasts'),

('yeast-fresh', 'leavening',
  '{"es":"levadura fresca","fr":"levure fraîche","en":"fresh yeast"}'::jsonb,
  '{"fr":["levure de boulanger","levure fraîche de boulanger","levure pressée"],"es":["levadura de panadería fresca","levadura prensada"],"en":["fresh baker''s yeast","compressed yeast"]}'::jsonb,
  'en:yeasts'),

('cream-of-tartar', 'leavening',
  '{"es":"crémor tártaro","fr":"crème de tartre","en":"cream of tartar"}'::jsonb,
  '{"fr":["tartrate acide de potassium"],"es":["ácido tartárico"],"en":["potassium bitartrate","tartaric acid"]}'::jsonb,
  'en:leavening-agents'),

('pectin-NH', 'leavening',
  '{"es":"pectina NH","fr":"pectine NH","en":"NH pectin"}'::jsonb,
  '{"fr":["pectine NH nappage","pectine thermoréversible"],"es":["pectina NH para glaseado"]}'::jsonb,
  'en:gelling-agents'),

('pectin-X58', 'leavening',
  '{"es":"pectina X58","fr":"pectine X58","en":"X58 pectin"}'::jsonb,
  '{"fr":["pectine acide","pectine X58 pour insert"]}'::jsonb,
  'en:gelling-agents'),

-- ═══ GELATIN ═══
('gelatin-sheet', 'gelatin',
  '{"es":"gelatina en hojas","fr":"gélatine en feuilles","en":"gelatin sheets"}'::jsonb,
  '{"fr":["feuilles de gélatine","gélatine or","gélatine argent","gélatine bronze","feuilles gélatine","gélatine 200 bloom"],"es":["hojas de gelatina","cola de pescado","gelatina en láminas"],"en":["leaf gelatin","sheet gelatin","gold gelatin","silver gelatin"]}'::jsonb,
  'en:gelling-agents'),

('gelatin-powder', 'gelatin',
  '{"es":"gelatina en polvo","fr":"gélatine en poudre","en":"gelatin powder"}'::jsonb,
  '{"fr":["gélatine poudre","gélatine bovine"],"es":["gelatina neutra en polvo"],"en":["powdered gelatin","Knox gelatin"]}'::jsonb,
  'en:gelling-agents'),

('agar-agar', 'gelatin',
  '{"es":"agar-agar","fr":"agar-agar","en":"agar-agar"}'::jsonb,
  '{"fr":["agar","gélose"],"es":["agar","gelatina vegetal"],"en":["agar","kanten"]}'::jsonb,
  'en:gelling-agents'),

-- ═══ LIQUID ═══
('water', 'liquid',
  '{"es":"agua","fr":"eau","en":"water"}'::jsonb,
  '{"fr":["eau minérale","eau plate","eau froide","eau chaude","eau tiède"],"es":["agua mineral","agua fría","agua templada"]}'::jsonb,
  NULL),

('rum', 'liquid',
  '{"es":"ron","fr":"rhum","en":"rum"}'::jsonb,
  '{"fr":["rhum blanc","rhum brun","rhum ambré","rhum agricole"],"es":["ron blanco","ron dorado","ron añejo"],"en":["white rum","dark rum","spiced rum"]}'::jsonb,
  'en:rums'),

('grand-marnier', 'liquid',
  '{"es":"Grand Marnier","fr":"Grand Marnier","en":"Grand Marnier"}'::jsonb,
  '{"fr":["Grand Marnier Cordon Rouge","liqueur d''orange"],"es":["licor de naranja"]}'::jsonb,
  'en:spirits'),

('cointreau', 'liquid',
  '{"es":"Cointreau","fr":"Cointreau","en":"Cointreau"}'::jsonb,
  '{"fr":["triple sec","curaçao triple sec"],"es":["triple seco","curaçao"],"en":["triple sec","orange liqueur"]}'::jsonb,
  'en:spirits'),

('kirsch', 'liquid',
  '{"es":"kirsch","fr":"kirsch","en":"kirsch"}'::jsonb,
  '{"fr":["eau-de-vie de cerise","kirchwasser"],"es":["aguardiente de cereza"]}'::jsonb,
  'en:spirits'),

('coffee', 'liquid',
  '{"es":"café","fr":"café","en":"coffee"}'::jsonb,
  '{"fr":["café fort","café soluble","café liquide","extrait de café","café instantané"],"es":["café fuerte","café instantáneo","extracto de café","café soluble"],"en":["strong coffee","espresso","instant coffee","coffee extract"]}'::jsonb,
  'en:coffees'),

('amaretto', 'liquid',
  '{"es":"amaretto","fr":"amaretto","en":"amaretto"}'::jsonb,
  '{"fr":["liqueur d''amande","Disaronno"],"es":["licor de almendra","Disaronno"]}'::jsonb,
  'en:spirits'),

('pineapple', 'fruit',
  '{"es":"piña","fr":"ananas","en":"pineapple"}'::jsonb,
  '{"fr":["ananas frais","purée d''ananas"],"es":["piña fresca","ananá","purée de piña"],"en":["fresh pineapple","pineapple puree"]}'::jsonb,
  'en:fruits'),

-- ═══ NUT ═══
('almond', 'nut',
  '{"es":"almendra","fr":"amande","en":"almond"}'::jsonb,
  '{"fr":["amandes entières","amandes effilées","amandes concassées","amandes grillées","amandes hachées","amandes effilées grillées"],"es":["almendras enteras","almendras laminadas","almendras troceadas","almendras tostadas"],"en":["whole almonds","sliced almonds","chopped almonds","blanched almonds"]}'::jsonb,
  'en:nuts'),

('hazelnut', 'nut',
  '{"es":"avellana","fr":"noisette","en":"hazelnut"}'::jsonb,
  '{"fr":["noisettes entières","noisettes torréfiées","noisettes grillées","noisettes concassées","noisettes hachées"],"es":["avellanas enteras","avellanas tostadas","avellanas troceadas"],"en":["whole hazelnuts","roasted hazelnuts","chopped hazelnuts"]}'::jsonb,
  'en:nuts'),

('walnut', 'nut',
  '{"es":"nuez","fr":"noix","en":"walnut"}'::jsonb,
  '{"fr":["noix de Grenoble","cerneaux de noix","noix concassées"],"es":["nueces","nueces peladas","nueces troceadas"],"en":["walnuts","walnut halves"]}'::jsonb,
  'en:nuts'),

('pistachio', 'nut',
  '{"es":"pistacho","fr":"pistache","en":"pistachio"}'::jsonb,
  '{"fr":["pistaches entières","pistaches grillées","pistaches concassées","pistaches émondées"],"es":["pistachos enteros","pistachos tostados","pistachos pelados"],"en":["pistachios","roasted pistachios","shelled pistachios"]}'::jsonb,
  'en:nuts'),

('pecan', 'nut',
  '{"es":"pacana","fr":"noix de pécan","en":"pecan"}'::jsonb,
  '{"fr":["noix pécan","pacane"],"es":["nuez pecana","nuez de pacana"],"en":["pecan nut"]}'::jsonb,
  'en:nuts'),

('cashew', 'nut',
  '{"es":"anacardo","fr":"noix de cajou","en":"cashew"}'::jsonb,
  '{"fr":["cajou","noix cajou"],"es":["nuez de cajú","cajú"],"en":["cashew nut"]}'::jsonb,
  'en:nuts'),

('pine-nut', 'nut',
  '{"es":"piñón","fr":"pignon","en":"pine nut"}'::jsonb,
  '{"fr":["pignons de pin","pignons","noix de pin"],"es":["piñones"],"en":["pine nuts","pignolia"]}'::jsonb,
  'en:nuts'),

('peanut', 'nut',
  '{"es":"cacahuete","fr":"cacahuète","en":"peanut"}'::jsonb,
  '{"fr":["arachide","cacahuètes grillées","peanut butter"],"es":["cacahuete tostado","maní","mantequilla de cacahuete"],"en":["groundnut","roasted peanuts","peanut butter"]}'::jsonb,
  'en:nuts'),

('macadamia', 'nut',
  '{"es":"macadamia","fr":"macadamia","en":"macadamia"}'::jsonb,
  '{"fr":["noix de macadamia"],"es":["nuez de macadamia"],"en":["macadamia nut"]}'::jsonb,
  'en:nuts'),

('almond-paste', 'nut',
  '{"es":"mazapán","fr":"pâte d''amande","en":"almond paste"}'::jsonb,
  '{"fr":["pâte d''amandes","massepain","pâte d''amande crue","tant pour tant crue"],"es":["pasta de almendra","marzipan","mazapán crudo"],"en":["marzipan","raw marzipan"]}'::jsonb,
  'en:nuts'),

-- ═══ OTHER ═══
('lemon-zest', 'other',
  '{"es":"ralladura de limón","fr":"zeste de citron","en":"lemon zest"}'::jsonb,
  '{"fr":["zestes de citron","écorce de citron","râpure de citron"],"es":["cáscara de limón rallada","piel de limón"],"en":["grated lemon zest","lemon peel"]}'::jsonb,
  NULL),

('orange-zest', 'other',
  '{"es":"ralladura de naranja","fr":"zeste d''orange","en":"orange zest"}'::jsonb,
  '{"fr":["zestes d''orange","écorce d''orange"],"es":["cáscara de naranja rallada","piel de naranja"],"en":["grated orange zest","orange peel"]}'::jsonb,
  NULL),

('food-coloring', 'other',
  '{"es":"colorante alimentario","fr":"colorant alimentaire","en":"food coloring"}'::jsonb,
  '{"fr":["colorant en poudre","colorant liquide","colorant en gel","colorant hydrosoluble","colorant liposoluble"],"es":["colorante en polvo","colorante líquido","colorante en gel"],"en":["food dye","gel food coloring","powder food coloring"]}'::jsonb,
  NULL)

ON CONFLICT (canonical_name) DO NOTHING;
