-- ═══════════════════════════════════════════════════════════════════
-- Seed: ~200 ingredientes de repostería (ES / FR / EN)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO public.ingredients (canonical_name, category, translations, aliases, off_category) VALUES

-- ─── DAIRY ──────────────────────────────────────────────────────────
('butter', 'dairy',
  '{"es":"mantequilla","fr":"beurre","en":"butter"}',
  '{"fr":["beurre doux","beurre pommade","beurre froid","beurre noisette","beurre clarifié","beurre mou","beurre tempéré","beurre sec"],"es":["mantequilla sin sal","mantequilla pomada","mantequilla fría","mantequilla derretida","mantequilla noisette","manteca"],"en":["unsalted butter","softened butter","clarified butter","brown butter","cold butter"]}',
  'en:butter'),

('heavy-cream', 'dairy',
  '{"es":"nata líquida","fr":"crème liquide","en":"heavy cream"}',
  '{"fr":["crème fleurette","crème entière","crème fraîche liquide","crème liquide entière","crème liquide 30% MG","crème liquide 32-34% MG","crème liquide 35%","crème liquide 30%","crème UHT","crème 30%","crème 35%","crème 32%"],"es":["nata para montar","nata montable","nata entera","nata 35%","nata 30%"],"en":["whipping cream","double cream","single cream","full-fat cream"]}',
  'en:creams'),

('milk', 'dairy',
  '{"es":"leche","fr":"lait","en":"milk"}',
  '{"fr":["lait entier","lait demi-écrémé","lait frais entier","lait UHT","lait de vache"],"es":["leche entera","leche semidesnatada","leche fresca","leche UHT"],"en":["whole milk","full-fat milk","semi-skimmed milk"]}',
  'en:milks'),

('mascarpone', 'dairy',
  '{"es":"mascarpone","fr":"mascarpone","en":"mascarpone"}',
  '{"fr":[],"es":[],"en":[]}',
  'en:cheeses'),

('cream-cheese', 'dairy',
  '{"es":"queso crema","fr":"fromage blanc","en":"cream cheese"}',
  '{"fr":["fromage frais","fromage à tartiner","philadelphia","fromage à la crème"],"es":["queso philadelphia","queso fresco batido","queso fresco","queso para untar"],"en":["philadelphia","cream cheese spread","soft cheese"]}',
  'en:cheeses'),

('creme-fraiche', 'dairy',
  '{"es":"crème fraîche","fr":"crème fraîche","en":"crème fraîche"}',
  '{"fr":["crème épaisse","crème fraîche épaisse","crème aigre"],"es":["crema agria","crema ácida"],"en":["sour cream","thick cream","crème fraiche"]}',
  'en:creams'),

('yogurt', 'dairy',
  '{"es":"yogur","fr":"yaourt","en":"yogurt"}',
  '{"fr":["yaourt nature","yogourt","yaourt grec"],"es":["yogurt natural","yogur griego","yogur entero"],"en":["yoghurt","natural yogurt","greek yogurt"]}',
  'en:yogurts'),

('condensed-milk', 'dairy',
  '{"es":"leche condensada","fr":"lait concentré sucré","en":"condensed milk"}',
  '{"fr":["lait concentré","lait Nestlé"],"es":["leche condensada entera"],"en":["sweetened condensed milk"]}',
  NULL),

('evaporated-milk', 'dairy',
  '{"es":"leche evaporada","fr":"lait concentré non sucré","en":"evaporated milk"}',
  '{"fr":["lait évaporé","lait concentré non sucré"],"es":["leche evaporada sin azúcar"],"en":[]}',
  NULL),

('milk-powder', 'dairy',
  '{"es":"leche en polvo","fr":"lait en poudre","en":"milk powder"}',
  '{"fr":["lait écrémé en poudre","poudre de lait"],"es":["leche desnatada en polvo","leche deshidratada"],"en":["powdered milk","dried milk"]}',
  NULL),

('ricotta', 'dairy',
  '{"es":"ricotta","fr":"ricotta","en":"ricotta"}',
  '{"fr":["ricotta fraîche"],"es":["requesón","ricota"],"en":["ricotta cheese"]}',
  'en:cheeses'),

('whipped-cream', 'dairy',
  '{"es":"nata montada","fr":"crème fouettée","en":"whipped cream"}',
  '{"fr":["chantilly","crème montée","crème chantilly"],"es":["chantilly","nata chantilly","crema chantilly"],"en":["chantilly cream","chantilly"]}',
  NULL),

('butter-salted', 'dairy',
  '{"es":"mantequilla con sal","fr":"beurre demi-sel","en":"salted butter"}',
  '{"fr":["beurre salé","beurre bretagne"],"es":["mantequilla salada"],"en":["salted butter"]}',
  NULL),

-- ─── FLOUR ──────────────────────────────────────────────────────────
('flour-wheat', 'flour',
  '{"es":"harina","fr":"farine","en":"flour"}',
  '{"fr":["farine de blé","farine T45","farine T55","farine T65","farine blanche","farine tout usage","farine tamisée"],"es":["harina de trigo","harina de repostería","harina floja","harina de fuerza","harina panificable","harina normal"],"en":["all-purpose flour","plain flour","bread flour","cake flour","wheat flour","T45","T55"]}',
  'en:flours'),

('almond-flour', 'flour',
  '{"es":"harina de almendra","fr":"poudre d''amande","en":"almond flour"}',
  '{"fr":["poudre d''amandes","poudre d''amande blanche","poudre d''amande émondée","amandes en poudre"],"es":["almendra molida","almendra en polvo","harina de almendras"],"en":["almond meal","ground almonds"]}',
  'en:nuts'),

('starch-potato', 'flour',
  '{"es":"fécula de patata","fr":"fécule de pomme de terre","en":"potato starch"}',
  '{"fr":["fécule","fécule de maïs","amidon de pomme de terre"],"es":["almidón de patata","fécula"],"en":["potato flour","fécule"]}',
  NULL),

('starch-corn', 'flour',
  '{"es":"maicena","fr":"maïzena","en":"cornstarch"}',
  '{"fr":["amidon de maïs","fécule de maïs","Maïzena","maizena"],"es":["maizena","almidón de maíz","fécula de maíz"],"en":["corn starch","maizena","corn flour"]}',
  NULL),

('hazelnut-flour', 'flour',
  '{"es":"harina de avellana","fr":"poudre de noisette","en":"hazelnut flour"}',
  '{"fr":["poudre de noisettes","noisettes en poudre","noisettes torréfiées en poudre"],"es":["avellana molida","avellana en polvo"],"en":["ground hazelnuts","hazelnut meal"]}',
  'en:nuts'),

('pistachio-flour', 'flour',
  '{"es":"harina de pistacho","fr":"poudre de pistache","en":"pistachio flour"}',
  '{"fr":["pistaches en poudre"],"es":["pistacho molido","pistacho en polvo"],"en":["ground pistachios","pistachio meal"]}',
  'en:nuts'),

('coconut-flour', 'flour',
  '{"es":"harina de coco","fr":"farine de coco","en":"coconut flour"}',
  '{"fr":["noix de coco râpée","coco râpé","noix de coco en poudre"],"es":["coco rallado","coco en polvo"],"en":["desiccated coconut","coconut powder"]}',
  NULL),

('flour-rice', 'flour',
  '{"es":"harina de arroz","fr":"farine de riz","en":"rice flour"}',
  '{"fr":["farine de riz blanc"],"es":["harina de arroz blanco"],"en":[]}',
  NULL),

('flour-rye', 'flour',
  '{"es":"harina de centeno","fr":"farine de seigle","en":"rye flour"}',
  '{"fr":["seigle"],"es":[],"en":[]}',
  NULL),

('flour-spelt', 'flour',
  '{"es":"harina de espelta","fr":"farine d''épeautre","en":"spelt flour"}',
  '{"fr":["épeautre"],"es":[],"en":[]}',
  NULL),

('semolina', 'flour',
  '{"es":"sémola","fr":"semoule","en":"semolina"}',
  '{"fr":["semoule de blé","semoule fine"],"es":["sémola de trigo","semolina"],"en":["semolina flour"]}',
  NULL),

('breadcrumbs', 'flour',
  '{"es":"pan rallado","fr":"chapelure","en":"breadcrumbs"}',
  '{"fr":["panure","chapelure fine"],"es":["pan molido"],"en":["bread crumbs"]}',
  NULL),

-- ─── SUGAR ──────────────────────────────────────────────────────────
('sugar', 'sugar',
  '{"es":"azúcar","fr":"sucre","en":"sugar"}',
  '{"fr":["sucre semoule","sucre en poudre","sucre cristallisé","sucre blanc","sucre fin"],"es":["azúcar blanco","azúcar blanquilla","azúcar fino","azúcar granulado"],"en":["granulated sugar","caster sugar","white sugar","fine sugar"]}',
  'en:sugars'),

('powdered-sugar', 'sugar',
  '{"es":"azúcar glas","fr":"sucre glace","en":"powdered sugar"}',
  '{"fr":["sucre impalpable","sucre en neige","sucre à glacer"],"es":["azúcar lustre","azúcar impalpable","azúcar flor","icing sugar"],"en":["icing sugar","confectioners sugar","confectioners'' sugar"]}',
  'en:sugars'),

('brown-sugar', 'sugar',
  '{"es":"azúcar moreno","fr":"cassonade","en":"brown sugar"}',
  '{"fr":["sucre roux","sucre brun","vergeoise","vergeoise blonde","vergeoise brune"],"es":["azúcar integral","panela","piloncillo","azúcar de caña"],"en":["demerara sugar","raw cane sugar","dark brown sugar","light brown sugar"]}',
  'en:sugars'),

('muscovado', 'sugar',
  '{"es":"azúcar muscovado","fr":"sucre muscovado","en":"muscovado sugar"}',
  '{"fr":["muscovado"],"es":["azúcar negro","azúcar moscovado"],"en":["muscovado","dark muscovado"]}',
  'en:sugars'),

('honey', 'sugar',
  '{"es":"miel","fr":"miel","en":"honey"}',
  '{"fr":["miel liquide","miel d''acacia","miel toutes fleurs","miel de fleurs"],"es":["miel de acacia","miel líquida","miel cruda"],"en":["acacia honey","raw honey","clear honey"]}',
  'en:honeys'),

('maple-syrup', 'sugar',
  '{"es":"sirope de arce","fr":"sirop d''érable","en":"maple syrup"}',
  '{"fr":["sirop d''érable pur"],"es":["jarabe de arce","syrup de arce"],"en":["pure maple syrup"]}',
  NULL),

('glucose', 'sugar',
  '{"es":"glucosa","fr":"glucose","en":"glucose"}',
  '{"fr":["sirop de glucose","glucose liquide","dextrose"],"es":["jarabe de glucosa","sirope de glucosa","dextrosa"],"en":["glucose syrup","liquid glucose","dextrose"]}',
  NULL),

('invert-sugar', 'sugar',
  '{"es":"azúcar invertido","fr":"sucre inverti","en":"invert sugar"}',
  '{"fr":["trimoline","sucre inverti liquide","intervert"],"es":["trimolina","azúcar invertida"],"en":["trimoline","invertase sugar"]}',
  NULL),

('isomalt', 'sugar',
  '{"es":"isomalt","fr":"isomalt","en":"isomalt"}',
  '{"fr":[],"es":[],"en":[]}',
  NULL),

('vanilla-sugar', 'sugar',
  '{"es":"azúcar de vainilla","fr":"sucre vanillé","en":"vanilla sugar"}',
  '{"fr":["sucre à la vanille"],"es":["azúcar vainillado"],"en":[]}',
  NULL),

('caramel', 'sugar',
  '{"es":"caramelo","fr":"caramel","en":"caramel"}',
  '{"fr":["caramel liquide","caramel à sec","sauce caramel"],"es":["salsa de caramelo","caramelo líquido"],"en":["caramel sauce","liquid caramel","dry caramel"]}',
  NULL),

('praline-paste', 'sugar',
  '{"es":"praliné","fr":"praliné","en":"praline paste"}',
  '{"fr":["praliné noisette","praliné amande","pâte praliné","praliné 50%","praliné 60%"],"es":["pasta de praliné","pralinée"],"en":["praline","hazelnut praline","almond praline"]}',
  NULL),

-- ─── FAT ────────────────────────────────────────────────────────────
('oil-neutral', 'fat',
  '{"es":"aceite neutro","fr":"huile neutre","en":"neutral oil"}',
  '{"fr":["huile de tournesol","huile de pépins de raisin","huile végétale","huile de colza"],"es":["aceite de girasol","aceite vegetal","aceite de pepita de uva"],"en":["sunflower oil","vegetable oil","grape seed oil","canola oil"]}',
  'en:plant-oils'),

('oil-olive', 'fat',
  '{"es":"aceite de oliva","fr":"huile d''olive","en":"olive oil"}',
  '{"fr":["huile d''olive vierge extra","EVOO"],"es":["aceite de oliva virgen extra","AOVE"],"en":["extra virgin olive oil","EVOO"]}',
  'en:olive-oils'),

('coconut-oil', 'fat',
  '{"es":"aceite de coco","fr":"huile de coco","en":"coconut oil"}',
  '{"fr":["huile de coprah"],"es":["aceite de coco virgen"],"en":["virgin coconut oil","coconut fat"]}',
  NULL),

('cocoa-butter', 'fat',
  '{"es":"manteca de cacao","fr":"beurre de cacao","en":"cocoa butter"}',
  '{"fr":["beurre cacao"],"es":["grasa de cacao"],"en":[]}',
  NULL),

-- ─── EGG ────────────────────────────────────────────────────────────
('egg', 'egg',
  '{"es":"huevo","fr":"oeuf","en":"egg"}',
  '{"fr":["oeuf entier","oeufs","oeufs entiers","oeuf (1 huevo aprox.)","oeuf (1 huevo)"],"es":["huevo entero","huevos","huevo fresco","1 huevo"],"en":["whole egg","eggs"]}',
  'en:eggs'),

('egg-yolk', 'egg',
  '{"es":"yema","fr":"jaune d''oeuf","en":"egg yolk"}',
  '{"fr":["jaunes d''oeufs","jaune","jaunes","jaune d''oeuf (4-5)","jaunes d''oeufs (4-5)"],"es":["yemas","yema de huevo","yemas de huevo"],"en":["egg yolks","yolks"]}',
  'en:eggs'),

('egg-white', 'egg',
  '{"es":"clara","fr":"blanc d''oeuf","en":"egg white"}',
  '{"fr":["blancs d''oeufs","blancs","blanc d''oeuf","blancs d''oeuf","blanc"],"es":["claras","clara de huevo","claras de huevo"],"en":["egg whites","whites"]}',
  'en:eggs'),

('egg-white-powder', 'egg',
  '{"es":"clara en polvo","fr":"blanc d''oeuf en poudre","en":"egg white powder"}',
  '{"fr":["albumine","poudre de blancs"],"es":["albúmina","albumina en polvo"],"en":["albumin powder","dried egg white"]}',
  NULL),

-- ─── CHOCOLATE ──────────────────────────────────────────────────────
('dark-chocolate', 'chocolate',
  '{"es":"chocolate negro","fr":"chocolat noir","en":"dark chocolate"}',
  '{"fr":["chocolat amer","couverture noire","chocolat de couverture","chocolat 70%","chocolat 64%","chocolat 66%","chocolat 72%","chocolat Guanaja","chocolat Manjari","chocolat Caraïbe","chocolat Valrhona noir","Caraïbe Valrhona","Guanaja Valrhona"],"es":["chocolate fondant","chocolate amargo","cobertura negra","chocolate 70%","chocolate extra negro"],"en":["bittersweet chocolate","semisweet chocolate","dark couverture","70% chocolate","couverture chocolate"]}',
  'en:chocolates'),

('milk-chocolate', 'chocolate',
  '{"es":"chocolate con leche","fr":"chocolat au lait","en":"milk chocolate"}',
  '{"fr":["couverture lait","chocolat lait","Jivara Valrhona","Tanariva","chocolat au lait 40%"],"es":["chocolate con leche couverture","cobertura con leche"],"en":["milk couverture","milk chocolate chips"]}',
  'en:chocolates'),

('white-chocolate', 'chocolate',
  '{"es":"chocolate blanco","fr":"chocolat blanc","en":"white chocolate"}',
  '{"fr":["couverture blanc","chocolat blanc (Ivoire Valrhona)","Ivoire Valrhona","Opalys Valrhona","Zéphyr Cacao Barry","chocolat blanc couverture"],"es":["cobertura blanca","chocolate blanco couverture"],"en":["white couverture","white chocolate couverture","Ivoire"]}',
  'en:chocolates'),

('cocoa-powder', 'chocolate',
  '{"es":"cacao en polvo","fr":"cacao en poudre","en":"cocoa powder"}',
  '{"fr":["poudre de cacao","cacao pur","cacao non sucré","cacao Van Houten","cacao Valrhona"],"es":["cacao puro","cacao amargo","cacao sin azúcar"],"en":["unsweetened cocoa powder","dutch cocoa","cocoa"]}',
  'en:cocoa'),

('cocoa-paste', 'chocolate',
  '{"es":"pasta de cacao","fr":"pâte de cacao","en":"cocoa paste"}',
  '{"fr":["masse de cacao","liqueur de cacao","pâte de cacao pur"],"es":["masa de cacao","licor de cacao"],"en":["cocoa mass","chocolate liquor"]}',
  NULL),

('cocoa-nibs', 'chocolate',
  '{"es":"nibs de cacao","fr":"éclats de cacao","en":"cocoa nibs"}',
  '{"fr":["grué de cacao","nibs de cacao","éclats de fèves de cacao"],"es":["grué de cacao","cacao crudo troceado"],"en":["cacao nibs","roasted cacao nibs"]}',
  NULL),

('gianduja', 'chocolate',
  '{"es":"gianduja","fr":"gianduja","en":"gianduja"}',
  '{"fr":["gianduja noisette","gianduja lait","praliné gianduja"],"es":["gianduia"],"en":["gianduia"]}',
  NULL),

('chocolate-chips', 'chocolate',
  '{"es":"pepitas de chocolate","fr":"pépites de chocolat","en":"chocolate chips"}',
  '{"fr":["chunks de chocolat","copeaux de chocolat","drops de chocolat"],"es":["chips de chocolate","gotas de chocolate"],"en":["chocolate drops","chocolate chunks"]}',
  NULL),

-- ─── FRUIT ──────────────────────────────────────────────────────────
('strawberry', 'fruit',
  '{"es":"fresa","fr":"fraise","en":"strawberry"}',
  '{"fr":["fraises","fraises fraîches","fraise gariguette","fraise Mara des bois","purée de fraise"],"es":["fresas","fresón","puré de fresa"],"en":["strawberries","fresh strawberries","strawberry puree"]}',
  'en:strawberries'),

('raspberry', 'fruit',
  '{"es":"frambuesa","fr":"framboise","en":"raspberry"}',
  '{"fr":["framboises","framboises fraîches","purée de framboise","coulis de framboise"],"es":["frambuesas","puré de frambuesa"],"en":["raspberries","raspberry puree","raspberry coulis"]}',
  'en:raspberries'),

('lemon', 'fruit',
  '{"es":"limón","fr":"citron","en":"lemon"}',
  '{"fr":["citron jaune","jus de citron","jus de citron frais","zeste de citron","citron non traité"],"es":["limón amarillo","zumo de limón","jugo de limón","ralladura de limón"],"en":["lemon juice","fresh lemon","lemon zest","unwaxed lemon"]}',
  'en:lemons'),

('lime', 'fruit',
  '{"es":"lima","fr":"citron vert","en":"lime"}',
  '{"fr":["citron vert","jus de citron vert","zeste de citron vert","lime"],"es":["lima persa","zumo de lima","ralladura de lima"],"en":["lime juice","lime zest","fresh lime"]}',
  'en:limes'),

('orange', 'fruit',
  '{"es":"naranja","fr":"orange","en":"orange"}',
  '{"fr":["orange non traitée","jus d''orange","zeste d''orange","orange confite"],"es":["zumo de naranja","jugo de naranja","ralladura de naranja","naranja confitada"],"en":["orange juice","orange zest","candied orange"]}',
  'en:oranges'),

('lemon-zest', 'fruit',
  '{"es":"ralladura de limón","fr":"zeste de citron","en":"lemon zest"}',
  '{"fr":["zeste de citron jaune","zestes de citron","zeste citron"],"es":["piel de limón","cáscara de limón"],"en":["lemon peel","lemon rind"]}',
  NULL),

('orange-zest', 'fruit',
  '{"es":"ralladura de naranja","fr":"zeste d''orange","en":"orange zest"}',
  '{"fr":["zestes d''orange","zeste orange"],"es":["piel de naranja","cáscara de naranja"],"en":["orange peel","orange rind"]}',
  NULL),

('passion-fruit', 'fruit',
  '{"es":"maracuyá","fr":"fruit de la passion","en":"passion fruit"}',
  '{"fr":["fruits de la passion","purée de fruit de la passion","maracuja","maracuyá"],"es":["fruta de la pasión","parchita","granadilla"],"en":["passionfruit","passion fruit puree"]}',
  'en:passion-fruits'),

('mango', 'fruit',
  '{"es":"mango","fr":"mangue","en":"mango"}',
  '{"fr":["mangue fraîche","purée de mangue"],"es":["mango fresco","puré de mango"],"en":["fresh mango","mango puree"]}',
  'en:mangoes'),

('cherry', 'fruit',
  '{"es":"cereza","fr":"cerise","en":"cherry"}',
  '{"fr":["cerises","cerises griotte","griottes","cerises confites","cerises amarena"],"es":["cerezas","guinda","amarena"],"en":["cherries","sour cherries","amarena cherries"]}',
  'en:cherries'),

('blueberry', 'fruit',
  '{"es":"arándano","fr":"myrtille","en":"blueberry"}',
  '{"fr":["myrtilles","myrtilles fraîches","purée de myrtilles"],"es":["arándanos","arándano azul"],"en":["blueberries","wild blueberries"]}',
  'en:blueberries'),

('blackcurrant', 'fruit',
  '{"es":"grosella negra","fr":"cassis","en":"blackcurrant"}',
  '{"fr":["groseille noire","purée de cassis","coulis de cassis"],"es":["casis","black currant"],"en":["black currant","blackcurrant puree"]}',
  NULL),

('apricot', 'fruit',
  '{"es":"albaricoque","fr":"abricot","en":"apricot"}',
  '{"fr":["abricots","purée d''abricot","confiture d''abricot","nappage abricot"],"es":["albaricoques","melocotón","albaricoque en almíbar"],"en":["apricots","apricot jam","apricot glaze"]}',
  'en:apricots'),

('pear', 'fruit',
  '{"es":"pera","fr":"poire","en":"pear"}',
  '{"fr":["poires","poire Williams","poire au sirop"],"es":["peras","pera en almíbar"],"en":["pears"]}',
  'en:pears'),

('banana', 'fruit',
  '{"es":"plátano","fr":"banane","en":"banana"}',
  '{"fr":["bananes","banane mûre"],"es":["bananas","plátano maduro"],"en":["bananas","ripe banana"]}',
  'en:bananas'),

('apple', 'fruit',
  '{"es":"manzana","fr":"pomme","en":"apple"}',
  '{"fr":["pommes","pomme Golden","pomme Granny Smith"],"es":["manzanas"],"en":["apples","cooking apple"]}',
  'en:apples'),

('coconut', 'fruit',
  '{"es":"coco","fr":"noix de coco","en":"coconut"}',
  '{"fr":["noix de coco râpée","coco râpé","pulpe de coco"],"es":["coco rallado","pulpa de coco"],"en":["desiccated coconut","shredded coconut","coconut flesh"]}',
  'en:coconuts'),

('fig', 'fruit',
  '{"es":"higo","fr":"figue","en":"fig"}',
  '{"fr":["figues","figues fraîches","figues sèches"],"es":["higos","higos secos","higo seco"],"en":["figs","dried figs"]}',
  'en:figs'),

('pineapple', 'fruit',
  '{"es":"piña","fr":"ananas","en":"pineapple"}',
  '{"fr":["ananas frais","dés d''ananas"],"es":["piña tropical","ananá"],"en":["pineapple chunks","fresh pineapple"]}',
  NULL),

('blackberry', 'fruit',
  '{"es":"mora","fr":"mûre","en":"blackberry"}',
  '{"fr":["mûres sauvages","mûres fraîches"],"es":["moras silvestres"],"en":["blackberries"]}',
  NULL),

('peach', 'fruit',
  '{"es":"melocotón","fr":"pêche","en":"peach"}',
  '{"fr":["pêches","pêche blanche","pêche jaune","pêche au sirop"],"es":["durazno","melocotón en almíbar"],"en":["peaches","white peach","yellow peach"]}',
  'en:peaches'),

-- ─── SPICE ──────────────────────────────────────────────────────────
('vanilla', 'spice',
  '{"es":"vainilla","fr":"vanille","en":"vanilla"}',
  '{"fr":["gousse de vanille","gousses de vanille","vanille en poudre","extrait de vanille","vanille liquide","extrait de vanille naturel sans alcool","extrait de vanille liquide sans alcool","poudre de vanille","graines de vanille","vanille Madagascar","gousses de vanille Madagascar","gousse de vanille Madagascar","vanille Bourbon","vanille Tahiti"],"es":["vaina de vainilla","vainas de vainilla","extracto de vainilla","vainilla en polvo","vainilla líquida","pasta de vainilla"],"en":["vanilla bean","vanilla pod","vanilla extract","vanilla powder","vanilla paste","Madagascar vanilla","Tahiti vanilla"]}',
  'en:spices'),

('cinnamon', 'spice',
  '{"es":"canela","fr":"cannelle","en":"cinnamon"}',
  '{"fr":["cannelle en poudre","cannelle moulue","bâton de cannelle","cannelle en bâton"],"es":["canela en polvo","canela molida","canela en rama"],"en":["ground cinnamon","cinnamon stick","cinnamon powder"]}',
  'en:cinnamon'),

('tonka-bean', 'spice',
  '{"es":"haba tonka","fr":"fève tonka","en":"tonka bean"}',
  '{"fr":["fèves tonka","tonka râpée"],"es":["habas tonka","tonka"],"en":["tonka beans","grated tonka"]}',
  NULL),

('ginger', 'spice',
  '{"es":"jengibre","fr":"gingembre","en":"ginger"}',
  '{"fr":["gingembre frais","gingembre en poudre","gingembre moulu","gingembre confit"],"es":["jengibre fresco","jengibre en polvo","jengibre molido","jengibre confitado"],"en":["fresh ginger","ground ginger","crystallized ginger"]}',
  'en:gingers'),

('cardamom', 'spice',
  '{"es":"cardamomo","fr":"cardamome","en":"cardamom"}',
  '{"fr":["cardamome en poudre","cardamome moulue","gousses de cardamome"],"es":["cardamomo en polvo","cardamomo molido"],"en":["ground cardamom","cardamom pods"]}',
  NULL),

('star-anise', 'spice',
  '{"es":"anís estrellado","fr":"anis étoilé","en":"star anise"}',
  '{"fr":["badiane","anis étoilé entier"],"es":["badiana","anise estrellado"],"en":["staranise","chinese star anise"]}',
  NULL),

('salt', 'spice',
  '{"es":"sal","fr":"sel","en":"salt"}',
  '{"fr":["sel fin","sel de table","sel ordinaire"],"es":["sal fina","sal común","sal de mesa"],"en":["table salt","fine salt","kosher salt"]}',
  NULL),

('fleur-de-sel', 'spice',
  '{"es":"flor de sal","fr":"fleur de sel","en":"fleur de sel"}',
  '{"fr":["fleur de sel de Guérande","fleur de sel de Camargue","sel de Guérande","sel en fleur"],"es":["flor de sal de Guérande"],"en":["sea salt flakes","Maldon salt","fleur de sel de Guerande"]}',
  NULL),

('pepper', 'spice',
  '{"es":"pimienta","fr":"poivre","en":"pepper"}',
  '{"fr":["poivre noir","poivre blanc","poivre de Sichuan","poivre long","poivre mignonette"],"es":["pimienta negra","pimienta blanca","pimienta de Sichuan"],"en":["black pepper","white pepper","Sichuan pepper"]}',
  NULL),

('nutmeg', 'spice',
  '{"es":"nuez moscada","fr":"muscade","en":"nutmeg"}',
  '{"fr":["noix de muscade","muscade râpée"],"es":["nuez moscada molida","nuez moscada rallada"],"en":["ground nutmeg","grated nutmeg"]}',
  NULL),

('coffee', 'spice',
  '{"es":"café","fr":"café","en":"coffee"}',
  '{"fr":["café soluble","café en poudre","expresso","café moulu","extrait de café","café lyophilisé"],"es":["café soluble","café molido","espresso","extracto de café","café liofilizado"],"en":["espresso","instant coffee","coffee extract","ground coffee","brewed coffee"]}',
  'en:coffees'),

-- ─── LEAVENING ──────────────────────────────────────────────────────
('baking-powder', 'leavening',
  '{"es":"levadura química","fr":"levure chimique","en":"baking powder"}',
  '{"fr":["levure en poudre","poudre à lever","levure alsacienne","levure Royal"],"es":["polvo de hornear","Royal","gasificante"],"en":["baking powder","double-acting baking powder"]}',
  NULL),

('yeast-dry', 'leavening',
  '{"es":"levadura seca","fr":"levure sèche","en":"dry yeast"}',
  '{"fr":["levure sèche active","levure déshydratée","levure de boulanger sèche","levure instantanée"],"es":["levadura de panadería seca","levadura deshidratada","levadura instantánea"],"en":["active dry yeast","instant yeast","fast-acting yeast","bread yeast"]}',
  NULL),

('yeast-fresh', 'leavening',
  '{"es":"levadura fresca","fr":"levure fraîche","en":"fresh yeast"}',
  '{"fr":["levure de boulanger fraîche","levure pressée","cube de levure"],"es":["levadura de panadería fresca","levadura prensada"],"en":["fresh baker''s yeast","cake yeast","compressed yeast"]}',
  NULL),

('baking-soda', 'leavening',
  '{"es":"bicarbonato sódico","fr":"bicarbonate de soude","en":"baking soda"}',
  '{"fr":["bicarbonate de sodium","bicarbonate alimentaire"],"es":["bicarbonato de sodio","bicarbonato"],"en":["bicarbonate of soda","sodium bicarbonate"]}',
  NULL),

('pectin-nh', 'leavening',
  '{"es":"pectina NH","fr":"pectine NH","en":"NH pectin"}',
  '{"fr":["pectine NH à confiture","pectine nappage","pectine réversible","pectine thermoreversible","pectine NH nappage"],"es":["pectina NH para confituras","pectina termorreversible"],"en":["NH pectin","nappage pectin","thermoreversible pectin"]}',
  NULL),

('pectin-yellow', 'leavening',
  '{"es":"pectina amarilla","fr":"pectine jaune","en":"yellow pectin"}',
  '{"fr":["pectine jaune à confiture","pectine X58","pectine irréversible"],"es":["pectina para mermelada","pectina irreversible"],"en":["jam pectin","yellow pectin","fruit pectin"]}',
  NULL),

('cream-of-tartar', 'leavening',
  '{"es":"cremor tártaro","fr":"crème de tartre","en":"cream of tartar"}',
  '{"fr":["tartre","acide tartrique"],"es":["crémor tártaro","bitartrato de potasio"],"en":["potassium bitartrate","tartar"]}',
  NULL),

-- ─── GELATIN ────────────────────────────────────────────────────────
('gelatin', 'gelatin',
  '{"es":"gelatina","fr":"gélatine","en":"gelatin"}',
  '{"fr":["gélatine en feuilles","feuilles de gélatine","gélatine Or","gélatine 200 Blooms","gélatine (4 feuilles Or 200 Blooms)","gélatine halal","feuilles d''or gélatine","gélatine en poudre","gélatine de poisson","gélatine boeuf","gélatine porc"],"es":["gelatina en hojas","hojas de gelatina","cola de pescado","gelatina en polvo","gelatina neutra"],"en":["gelatin sheets","gelatin leaves","gelatin powder","sheet gelatin","gold gelatin","200 bloom gelatin"]}',
  NULL),

('agar-agar', 'gelatin',
  '{"es":"agar-agar","fr":"agar-agar","en":"agar-agar"}',
  '{"fr":["agar","agar agar"],"es":["agar","agar agar"],"en":["agar","agar agar"]}',
  NULL),

('xanthan-gum', 'gelatin',
  '{"es":"goma xantana","fr":"gomme xanthane","en":"xanthan gum"}',
  '{"fr":["xanthane","gomme de xanthane"],"es":["xantano","goma xantan"],"en":["xanthan","xanthan gum powder"]}',
  NULL),

('tapioca', 'gelatin',
  '{"es":"tapioca","fr":"tapioca","en":"tapioca"}',
  '{"fr":["perles de tapioca","fécule de tapioca","amidon de tapioca"],"es":["perlas de tapioca","almidón de tapioca"],"en":["tapioca pearls","tapioca starch"]}',
  NULL),

('carrageenan', 'gelatin',
  '{"es":"carragenano","fr":"carraghénane","en":"carrageenan"}',
  '{"fr":["carraghénanes","carraghénane iota","carraghénane kappa"],"es":["carragenina","kappa-carragenano"],"en":["carrageenan iota","carrageenan kappa"]}',
  NULL),

('iota-carrageenan', 'gelatin',
  '{"es":"carragenano iota","fr":"carraghénane iota","en":"iota carrageenan"}',
  '{"fr":[],"es":[],"en":[]}',
  NULL),

-- ─── LIQUID ─────────────────────────────────────────────────────────
('water', 'liquid',
  '{"es":"agua","fr":"eau","en":"water"}',
  '{"fr":["eau minérale","eau du robinet","eau plate","eau de source","eau froide","eau chaude","eau minérale plate"],"es":["agua mineral","agua del grifo","agua fría","agua caliente"],"en":["mineral water","cold water","hot water","warm water"]}',
  NULL),

('rum', 'liquid',
  '{"es":"ron","fr":"rhum","en":"rum"}',
  '{"fr":["rhum brun","rhum blanc","rhum ambré","vieux rhum","rhum agricole","vieux rhum brun agricole","rhum Negrita","rhum Bacardi"],"es":["ron negro","ron blanco","ron añejo","ron agrícola"],"en":["dark rum","white rum","aged rum","Bacardi"]}',
  NULL),

('grand-marnier', 'liquid',
  '{"es":"Grand Marnier","fr":"Grand Marnier","en":"Grand Marnier"}',
  '{"fr":["Grand Marnier Cordon Rouge","liqueur d''orange"],"es":["licor de naranja"],"en":["orange liqueur"]}',
  NULL),

('kirsch', 'liquid',
  '{"es":"kirsch","fr":"kirsch","en":"kirsch"}',
  '{"fr":["kirsch d''Alsace","alcool de cerise","eau de vie de cerise"],"es":["aguardiente de cereza"],"en":["cherry brandy","kirshwasser"]}',
  NULL),

('cointreau', 'liquid',
  '{"es":"Cointreau","fr":"Cointreau","en":"Cointreau"}',
  '{"fr":["triple sec","curaçao","liqueur d''orange triple sec"],"es":["triple seco","curaçao"],"en":["triple sec","orange triple sec"]}',
  NULL),

('cognac', 'liquid',
  '{"es":"coñac","fr":"cognac","en":"cognac"}',
  '{"fr":["armagnac","brandy","eau de vie","calvados"],"es":["brandy","armagnac"],"en":["brandy","armagnac","French brandy"]}',
  NULL),

('amaretto', 'liquid',
  '{"es":"amaretto","fr":"amaretto","en":"amaretto"}',
  '{"fr":["liqueur d''amande","Amaretto di Saronno"],"es":["licor de almendra","Disaronno"],"en":["almond liqueur","Disaronno"]}',
  NULL),

('rose-water', 'liquid',
  '{"es":"agua de rosas","fr":"eau de rose","en":"rose water"}',
  '{"fr":["eau de rose alimentaire","eau florale de rose"],"es":["agua de rosa","hidrolato de rosa"],"en":["rosewater","rose water extract"]}',
  NULL),

('orange-blossom-water', 'liquid',
  '{"es":"agua de azahar","fr":"eau de fleur d''oranger","en":"orange blossom water"}',
  '{"fr":["eau de fleur d''oranger","fleur d''oranger","eau florale d''oranger"],"es":["agua de flor de naranjo","esencia de azahar"],"en":["orange flower water","neroli water"]}',
  NULL),

('tea', 'liquid',
  '{"es":"té","fr":"thé","en":"tea"}',
  '{"fr":["thé vert","thé noir","matcha","thé Earl Grey","thé infusé"],"es":["té verde","té negro","matcha","té Earl Grey"],"en":["green tea","black tea","matcha","Earl Grey tea","brewed tea"]}',
  NULL),

('caramel-liquid', 'liquid',
  '{"es":"caramelo líquido","fr":"caramel liquide","en":"liquid caramel"}',
  '{"fr":["sauce caramel","caramel beurre salé","coulis caramel"],"es":["salsa de caramelo","caramelo"],"en":["caramel sauce","salted caramel"]}',
  NULL),

('stock-syrup', 'liquid',
  '{"es":"almíbar","fr":"sirop","en":"simple syrup"}',
  '{"fr":["sirop de sucre","sirop simple","sirop à 30°","sirop à imbiber","sirop d''imbibage"],"es":["jarabe de azúcar","sirope","almíbar simple","sirope de imbibar"],"en":["sugar syrup","stock syrup","imbibing syrup","30 brix syrup"]}',
  NULL),

-- ─── NUT ────────────────────────────────────────────────────────────
('almond', 'nut',
  '{"es":"almendra","fr":"amande","en":"almond"}',
  '{"fr":["amandes","amandes entières","amandes mondées","amandes effilées","amandes hachées","amandes émondées","amandes torréfiées","amandes concassées","amandes en bâtonnets"],"es":["almendras","almendras enteras","almendras fileteadas","almendras picadas","almendras tostadas","almendras laminadas"],"en":["almonds","whole almonds","sliced almonds","blanched almonds","slivered almonds","chopped almonds"]}',
  'en:almonds'),

('hazelnut', 'nut',
  '{"es":"avellana","fr":"noisette","en":"hazelnut"}',
  '{"fr":["noisettes","noisettes entières","noisettes hachées","noisettes torréfiées","noisettes grillées","éclats de noisettes","noisettes concassées"],"es":["avellanas","avellanas enteras","avellanas tostadas","avellanas picadas"],"en":["hazelnuts","whole hazelnuts","toasted hazelnuts","roasted hazelnuts","chopped hazelnuts"]}',
  'en:hazelnuts'),

('walnut', 'nut',
  '{"es":"nuez","fr":"noix","en":"walnut"}',
  '{"fr":["cerneaux de noix","noix de Grenoble","noix hachées"],"es":["nueces","nueces de Castilla","nueces picadas"],"en":["walnuts","walnut halves","chopped walnuts"]}',
  'en:walnuts'),

('pistachio', 'nut',
  '{"es":"pistacho","fr":"pistache","en":"pistachio"}',
  '{"fr":["pistaches","pistaches mondées","pistaches torréfiées","pistaches non salées","éclats de pistache"],"es":["pistachos","pistachos crudos","pistachos sin sal","pistachos pelados"],"en":["pistachios","shelled pistachios","unsalted pistachios","chopped pistachios"]}',
  'en:pistachios'),

('pecan', 'nut',
  '{"es":"nuez pecana","fr":"noix de pécan","en":"pecan"}',
  '{"fr":["noix pecan","noix de pacane","pacanes"],"es":["pacanas","nueces de pecán"],"en":["pecans","pecan nuts","pecan halves"]}',
  'en:nuts'),

('cashew', 'nut',
  '{"es":"anacardo","fr":"noix de cajou","en":"cashew"}',
  '{"fr":["cajous","noix cajou","noix de caju"],"es":["anacardos","marañones","cajú"],"en":["cashews","cashew nuts"]}',
  'en:nuts'),

('pine-nut', 'nut',
  '{"es":"piñón","fr":"pignon","en":"pine nut"}',
  '{"fr":["pignons de pin","pignons"],"es":["piñones","piñones de pino"],"en":["pine nuts","pignoli"]}',
  'en:nuts'),

('peanut', 'nut',
  '{"es":"cacahuete","fr":"cacahuète","en":"peanut"}',
  '{"fr":["arachides","cacahouètes","beurre de cacahuètes","cacahuètes grillées"],"es":["cacahuetes","maní","crema de cacahuete","cacahuetes tostados"],"en":["peanuts","groundnuts","peanut butter"]}',
  'en:peanuts'),

('chestnut', 'nut',
  '{"es":"castaña","fr":"marron","en":"chestnut"}',
  '{"fr":["châtaignes","marrons glacés","purée de marrons","crème de marrons","farine de châtaigne"],"es":["castañas","puré de castañas","crema de castañas","marrón glacé"],"en":["chestnuts","candied chestnuts","chestnut puree","chestnut cream"]}',
  NULL),

('almond-paste', 'nut',
  '{"es":"pasta de almendra","fr":"pâte d''amande","en":"marzipan"}',
  '{"fr":["massepain","pâte d''amandes","marzipan","amandes broyées","pâte d''amandes crue"],"es":["mazapán","pasta de almendras","marzipán"],"en":["almond paste","raw marzipan","fondant marzipan"]}',
  NULL),

('macadamia', 'nut',
  '{"es":"macadamia","fr":"noix de macadamia","en":"macadamia nut"}',
  '{"fr":["macadamias","noix macadamia"],"es":["nuez de macadamia","macadamias"],"en":["macadamia nuts","macadamia"]}',
  'en:nuts'),

-- ─── OTHER ──────────────────────────────────────────────────────────
('titanium-dioxide', 'other',
  '{"es":"dióxido de titanio","fr":"dioxyde de titane","en":"titanium dioxide"}',
  '{"fr":["oxyde de titane","poudre de titane","poudre d''oxyde de titane","E171","colorant blanc"],"es":["óxido de titanio","E171","colorante blanco"],"en":["titanium oxide","E171","white food coloring"]}',
  NULL),

('neutral-glaze', 'other',
  '{"es":"glaseado neutro","fr":"nappage neutre","en":"neutral glaze"}',
  '{"fr":["nappage transparent","nappage à froid","miroir neutre","nappage miroir"],"es":["brillo neutro","napaje neutro","gel neutro"],"en":["mirror glaze neutral","clear nappage","clear glaze"]}',
  NULL),

('food-coloring', 'other',
  '{"es":"colorante alimentario","fr":"colorant alimentaire","en":"food coloring"}',
  '{"fr":["colorant en poudre","colorant hydrosoluble","colorant liposoluble","colorant rouge","colorant vert"],"es":["colorante en polvo","colorante en gel","colorante natural"],"en":["food colour","food dye","gel food coloring"]}',
  NULL),

('gold-leaf', 'other',
  '{"es":"pan de oro","fr":"feuille d''or","en":"gold leaf"}',
  '{"fr":["feuilles d''or alimentaire","or en feuilles","or comestible"],"es":["hoja de oro comestible","oro alimentario"],"en":["edible gold leaf","gold sheet"]}',
  NULL),

('silver-leaf', 'other',
  '{"es":"pan de plata","fr":"feuille d''argent","en":"silver leaf"}',
  '{"fr":["feuilles d''argent alimentaire","argent comestible"],"es":["hoja de plata comestible","plata alimentaria"],"en":["edible silver leaf","silver sheet"]}',
  NULL),

('rose-petals', 'other',
  '{"es":"pétalos de rosa","fr":"pétales de rose","en":"rose petals"}',
  '{"fr":["pétales de rose cristallisés","roses cristallisées"],"es":["pétalos de rosa cristalizados","rosas cristalizadas"],"en":["crystallized rose petals","candied rose petals"]}',
  NULL),

('neutral-pectin', 'other',
  '{"es":"pectina neutra","fr":"pectine neutre","en":"neutral pectin"}',
  '{"fr":["nappage à base de pectine","pectine nappage neutre"],"es":["napaje de pectina"],"en":["pectin nappage"]}',
  NULL),

('matcha', 'other',
  '{"es":"matcha","fr":"matcha","en":"matcha"}',
  '{"fr":["thé matcha","poudre de matcha","matcha en poudre"],"es":["té matcha","matcha en polvo"],"en":["matcha powder","green tea powder","ceremonial matcha"]}',
  NULL),

('lavender', 'other',
  '{"es":"lavanda","fr":"lavande","en":"lavender"}',
  '{"fr":["fleurs de lavande","lavande séchée","infusion lavande"],"es":["flores de lavanda","lavanda seca"],"en":["dried lavender","lavender flowers"]}',
  NULL),

('mint', 'other',
  '{"es":"menta","fr":"menthe","en":"mint"}',
  '{"fr":["menthe fraîche","feuilles de menthe","menthe poivrée"],"es":["menta fresca","hojas de menta","hierbabuena"],"en":["fresh mint","mint leaves","peppermint"]}',
  NULL),

('basil', 'other',
  '{"es":"albahaca","fr":"basilic","en":"basil"}',
  '{"fr":["basilic frais","feuilles de basilic","basilic thaï"],"es":["albahaca fresca","hojas de albahaca"],"en":["fresh basil","basil leaves"]}',
  NULL),

('thyme', 'other',
  '{"es":"tomillo","fr":"thym","en":"thyme"}',
  '{"fr":["thym frais","branche de thym","thym citron"],"es":["tomillo fresco","ramita de tomillo"],"en":["fresh thyme","thyme sprig","lemon thyme"]}',
  NULL),

('yeast-nutritional', 'other',
  '{"es":"levadura nutricional","fr":"levure nutritionnelle","en":"nutritional yeast"}',
  '{"fr":["levure de bière","levure maltée"],"es":["levadura de cerveza"],"en":["brewer''s yeast"]}',
  NULL),

('alcohol-neutral', 'liquid',
  '{"es":"alcohol neutro","fr":"alcool neutre","en":"neutral alcohol"}',
  '{"fr":["alcool alimentaire","alcool à 90°","vodka","alcool de fruits"],"es":["alcohol alimentario","vodka"],"en":["vodka","grain alcohol","spirit"]}',
  NULL),

('jam-apricot', 'other',
  '{"es":"mermelada de albaricoque","fr":"confiture d''abricot","en":"apricot jam"}',
  '{"fr":["gelée d''abricot","nappage abricot","confiture abricot"],"es":["confitura de albaricoque","gelatina de albaricoque","brillo de albaricoque"],"en":["apricot preserve","apricot jelly","apricot glaze"]}',
  NULL),

('candied-orange-peel', 'fruit',
  '{"es":"naranja confitada","fr":"orange confite","en":"candied orange peel"}',
  '{"fr":["zestes d''orange confits","écorces d''orange confites","orangeat"],"es":["piel de naranja confitada","corteza de naranja confitada"],"en":["candied orange","orange confit"]}',
  NULL),

('sesame', 'nut',
  '{"es":"sésamo","fr":"sésame","en":"sesame"}',
  '{"fr":["graines de sésame","sésame blanc","tahini","tahin"],"es":["semillas de sésamo","ajonjolí","tahín","tahini"],"en":["sesame seeds","tahini","white sesame"]}',
  NULL)

ON CONFLICT (canonical_name) DO UPDATE SET
  translations = EXCLUDED.translations,
  aliases = EXCLUDED.aliases,
  category = EXCLUDED.category,
  off_category = EXCLUDED.off_category;
