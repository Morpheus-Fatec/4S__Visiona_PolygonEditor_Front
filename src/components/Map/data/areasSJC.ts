const areasSJC = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: 1,
        alt: 'Área 1',
        name: 'Fazenda Recanto dos Pássaros',
        description:
          'Fazenda localizada na região oeste de São José dos Campos, sendo umas das principais áreas de plantio de milho da região.',
        fazenda: {
          nome: "Fazenda Recanto dos Pássaros",
          cidade: 'São José dos Campos',
          estado: 'São Paulo',
        },
      },
      geometry: {
        type: "MultiPolygon",
        coordinates: [
          [
            [
              [-49.343574245134789, -20.64802334007959],
              [-49.343581840423781, -20.649057784660272],
              [-49.343581985973344, -20.649059290143896],
              [-49.343582418892254, -20.64906081094739],
              [-49.343583125793373, -20.649062237885403],
              [-49.343584085197676, -20.649063527600845],
              [-49.343585267954495, -20.649064640906317],
              [-49.343586408787701, -20.649065415304278],
              [-49.343732323907318, -20.649149890428134],
              [-49.343733954528204, -20.649150620153307],
              [-49.343735570204899, -20.649151027651442],
              [-49.343736812150723, -20.649151156037362],
              [-49.343920694031453, -20.649158817782393],
              [-49.344388510080933, -20.649204832472492],
              [-49.344941022774549, -20.649258548987632],
              [-49.344941368872526, -20.649258576686634],
              [-49.346161296056891, -20.649335301666781],
              [-49.346920706466562, -20.649412009788762],
              [-49.347304297158018, -20.649458040671789],
              [-49.3473047388552, -20.649458083924458],
              [-49.349123273654811, -20.649596200491374],
              [-49.350020963836926, -20.649688271279331],
              [-49.350022003255162, -20.649688324424233],
              [-49.350023669567577, -20.649688187201718],
              [-49.350025285250013, -20.649687779703584],
              [-49.350026801210618, -20.649687114311575],
              [-49.350028171387748, -20.649686211243193],
              [-49.350029354149285, -20.649685097937663],
              [-49.350030313557568, -20.649683808222392],
              [-49.350030902348635, -20.649682671141761],
              [-49.350099419782055, -20.649522678726782],
              [-49.350099952548078, -20.649521516751804],
              [-49.350100083822781, -20.649521233419421],
              [-49.350100516742884, -20.64951971261587],
              [-49.350100662526188, -20.649518144155479],
              [-49.350100662519878, -20.649418385953084],
              [-49.350100516736688, -20.649416817492693],
              [-49.350100381018478, -20.649416214216501],
              [-49.350062194487634, -20.649271105432774],
              [-49.350046911604579, -20.649102993834902],
              [-49.350046795466483, -20.649102167708577],
              [-49.349893332713918, -20.648311834292826],
              [-49.349716841774011, -20.647291259052508],
              [-49.349716480879238, -20.647289902174521],
              [-49.349470880898195, -20.646599157189826],
              [-49.349470667827632, -20.646598633420183],
              [-49.349309519945223, -20.646237969158619],
              [-49.34930898483077, -20.646236954692597],
              [-49.349308025443975, -20.646235664976871],
              [-49.349306842708927, -20.646234551671],
              [-49.349305472562719, -20.646233648602333],
              [-49.349303956636277, -20.646232983210155],
              [-49.349302340990391, -20.646232575711963],
              [-49.349301634156916, -20.646232483752783],
              [-49.348165805552981, -20.64612504193434],
              [-49.343722609052179, -20.645810410015599],
              [-49.343721889095377, -20.645810384556228],
              [-49.343691194264807, -20.645810384556341],
              [-49.343689527994115, -20.645810521778799],
              [-49.343687912352721, -20.645810929277104],
              [-49.343686396430485, -20.645811594669397],
              [-49.343685026287915, -20.64581249773795],
              [-49.343683843556221, -20.645813611043934],
              [-49.343682884172097, -20.645814900759717],
              [-49.343682408852999, -20.645815784300339],
              [-49.343628692892537, -20.645930889915633],
              [-49.343628461323988, -20.645931433316036],
              [-49.343628028413775, -20.645932954120156],
              [-49.343627885448029, -20.645934303841727],
              [-49.343574258249419, -20.648020201268764],
              [-49.343574173642651, -20.648021672771051],
              [-49.343574245134789, -20.64802334007959]
            ],
            [
              [-49.345606024359995, -20.648465308740981],
              [-49.345555965577262, -20.648489474872065],
              [-49.345530579500291, -20.648486090342146],
              [-49.345493923153981, -20.648466797326762],
              [-49.345492521968595, -20.648466193316096],
              [-49.345490906299062, -20.648465785817962],
              [-49.345489239999949, -20.648465648595447],
              [-49.345487573700836, -20.648465785817962],
              [-49.345486399919423, -20.648466053272557],
              [-49.345438649194818, -20.648479980196157],
              [-49.345410153139596, -20.648485008960961],
              [-49.345389351311951, -20.648464207134282],
              [-49.345404890779093, -20.648414133886774],
              [-49.345433912250257, -20.648397061983417],
              [-49.345467757719121, -20.648395181611022],
              [-49.345496013500906, -20.648393163534195],
              [-49.345550455086709, -20.648389129804855],
              [-49.345576648633141, -20.648386596176977],
              [-49.34558964308053, -20.648395692484257],
              [-49.345604450163307, -20.648440113740435],
              [-49.345606024359995, -20.648465308740981]
            ]
          ]
        ]
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 2,
        alt: 'Área 2',
        name: 'Floresta preservada Campo da Mantiqueira',
        description:
          'Reserva localizada na região oeste de São José dos Campos, onde possui diversos tipos de árvores preservadas.',
        fazenda: {
          nome: "Fazenda Recanto dos Pássaros",
          cidade: 'São José dos Campos',
          estado: 'São Paulo',
        },
      },
      geometry: {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [-49.349341405712728, -20.646093440929832],
              [-49.349368876589779, -20.646098672319173],
              [-49.349383702013711, -20.64456918274935],
              [-49.349334283933906, -20.64451235195758],
              [-49.349188500598501, -20.644487642917678],
              [-49.348704203416453, -20.64451235195758],
              [-49.347913514139641, -20.644532119189499],
              [-49.347476164133404, -20.644524706477522],
              [-49.347194481078546, -20.644472817493732],
              [-49.346994337855349, -20.644344330486252],
              [-49.346774427400241, -20.64413183274311],
              [-49.346707712992504, -20.643981107599718],
              [-49.346663236720687, -20.643763668048596],
              [-49.34667559124064, -20.643608001097224],
              [-49.34679913644014, -20.643010042331639],
              [-49.34686585084787, -20.642639406733132],
              [-49.346905385311707, -20.642444205317922],
              [-49.346912798023681, -20.642370078198219],
              [-49.346893030791762, -20.642340427350341],
              [-49.346853496327917, -20.642281125654581],
              [-49.345580980773057, -20.64223170757478],
              [-49.344046549395252, -20.642194644014928],
              [-49.343816755324177, -20.642192173110939],
              [-49.343727802780535, -20.642204527630888],
              [-49.343693210124677, -20.642258887518668],
              [-49.343673442892758, -20.642372549102209],
              [-49.343666030180785, -20.642723417468794],
              [-49.343690739220683, -20.643499281321663],
              [-49.343700622836643, -20.643575879345352],
              [-49.343735215492508, -20.643610472001214],
              [-49.343794517188265, -20.643622826521163],
              [-49.343851347980035, -20.643667302792984],
              [-49.343868644307967, -20.643721662680765],
              [-49.343843935268069, -20.643753784432636],
              [-49.343789575380285, -20.643768609856576],
              [-49.343747570012454, -20.643788377088494],
              [-49.343740157300488, -20.643852620592238],
              [-49.343740157300488, -20.643921805903958],
              [-49.343740157300488, -20.64400581663962],
              [-49.343740157300488, -20.644117007319171],
              [-49.343745099108467, -20.644388806758073],
              [-49.343796988092258, -20.644643309869046],
              [-49.343816755324177, -20.644754500548597],
              [-49.343858760692008, -20.6448286276683],
              [-49.343861231596001, -20.64488792936406],
              [-49.343838993460089, -20.644962056483759],
              [-49.343806871708217, -20.644991707331641],
              [-49.343789575380285, -20.645036183603462],
              [-49.343801466934877, -20.645038448159916],
              [-49.343792046284257, -20.645051009027409],
              [-49.343742628204453, -20.64514984518701],
              [-49.343708035548595, -20.645263506770551],
              [-49.343678384700716, -20.645411761009953],
              [-49.343668501084757, -20.645545189825416],
              [-49.343698151932635, -20.645648967792997],
              [-49.343767337244358, -20.645718153104717],
              [-49.343974893179521, -20.645762629376538],
              [-49.344637095448846, -20.645816989264318],
              [-49.346732422032396, -20.645950418079778],
              [-49.347626889276782, -20.646024545199481],
              [-49.348620192680777, -20.64609867231918],
              [-49.349050129975041, -20.646143148591001],
              [-49.349331813029906, -20.646138206783021],
              [-49.349341405712728, -20.646093440929832]
            ],
            [
              [-49.347985170355358, -20.645606962425159],
              [-49.347990112163338, -20.645626729657078],
              [-49.347982699451364, -20.645631671465058],
              [-49.347955519507479, -20.64564896779299],
              [-49.347940694083533, -20.64565638050496],
              [-49.347896217811716, -20.645671205928899],
              [-49.347859154251864, -20.645671205928899],
              [-49.347822090692013, -20.645661322312939],
              [-49.347802323460094, -20.645636613273037],
              [-49.347792439844135, -20.645614375137129],
              [-49.347760318092263, -20.645629200561068],
              [-49.347730667244385, -20.645678618640869],
              [-49.347668894644634, -20.645686031352838],
              [-49.347599709332911, -20.64565638050496],
              [-49.347550291253114, -20.64559213700122],
              [-49.347535465829175, -20.645540248017429],
              [-49.347550291253114, -20.645483417225655],
              [-49.347636772892763, -20.645431528241865],
              [-49.347703487300492, -20.645399406489997],
              [-49.347775143516202, -20.645399406489997],
              [-49.347873979675803, -20.645414231913936],
              [-49.347935752275554, -20.645471062705706],
              [-49.347967874027425, -20.645518009881517],
              [-49.347985170355358, -20.645606962425159]
            ]
          ]
        ]
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 3,
        alt: 'Área 3',
        name: 'Floresta preservada Campo de Rosário',
        description:
          'Reserva localizada na região oeste de São José dos Campos, onde possui diversos tipos de rosas preservadas.',
        fazenda: {
          nome: "Fazenda Recanto dos Pássaros",
          cidade: 'São José dos Campos',
          estado: 'São Paulo',
        },
      },
      geometry: { "type": "MultiPolygon", "coordinates": [ [ [ [ -49.34938123110971, -20.644336917774279 ], [ -49.349403469245622, -20.643249720018666 ], [ -49.349408411053602, -20.642738242892733 ], [ -49.349373818397737, -20.642444205317918 ], [ -49.349354051165818, -20.642404670854077 ], [ -49.34932440031794, -20.642377490910189 ], [ -49.349250273198237, -20.642345369158317 ], [ -49.349136611614696, -20.642342898254331 ], [ -49.349037775455102, -20.642333014638371 ], [ -49.348832690423926, -20.642325601926402 ], [ -49.348360747761831, -20.642305834694483 ], [ -49.347078348591005, -20.642278654750587 ], [ -49.3470289305112, -20.64229595107852 ], [ -49.346994337855342, -20.642345369158321 ], [ -49.34697704152741, -20.64241702537403 ], [ -49.346902914407707, -20.642780248260564 ], [ -49.346794194632153, -20.643385619738122 ], [ -49.346754660168315, -20.643593175673285 ], [ -49.346739834744376, -20.643785906184508 ], [ -49.346779369208214, -20.64399840392765 ], [ -49.346897972599734, -20.644198547150843 ], [ -49.347088232206964, -20.644349272294235 ], [ -49.347295788142127, -20.644430812125904 ], [ -49.34754534944512, -20.644480230205701 ], [ -49.347760318092256, -20.644480230205701 ], [ -49.348091419226918, -20.644470346589742 ], [ -49.348704203416446, -20.64444316664585 ], [ -49.349094606246872, -20.644425870317921 ], [ -49.349287336758096, -20.644398690374029 ], [ -49.34938123110971, -20.644336917774279 ] ] ] ]

      },
    },
    {
      type: 'Feature',
      properties: {
        id: 4,
        alt: 'Área 4',
        name: 'Grande Banhado de São José dos Campos',
        description:
          'Banhado localizada na região central de São José dos Campos, onde possui diversos tipos de vegetação preservadas.',
        fazenda: {
          nome: "Fazenda Recanto dos Pássaros",
          cidade: 'São José dos Campos',
          estado: 'São Paulo',
        },
      },
      geometry: {
        coordinates: [
          [
            [-45.90309072058267, -23.162864995162195],
            [-45.90640689806244, -23.166513229258356],
            [-45.90776882609211, -23.168091887832503],
            [-45.908538626800635, -23.170704345934098],
            [-45.91333489867202, -23.174679092077497],
            [-45.91351264931981, -23.176856322814274],
            [-45.91546649442162, -23.180285881636536],
            [-45.91386777364508, -23.181646674590425],
            [-45.91064705919365, -23.18314662946642],
            [-45.91029177115021, -23.184888457263213],
            [-45.90887063650533, -23.18488846300626],
            [-45.908870641787985, -23.187936614203196],
            [-45.910350958449555, -23.192834986778124],
            [-45.90851551597683, -23.195445754137694],
            [-45.90342372037858, -23.19147365433369],
            [-45.898154613283936, -23.191473495214552],
            [-45.892946041769164, -23.190384552701715],
            [-45.88921536190952, -23.186847562401567],
            [-45.88880356347488, -23.180426276028925],
            [-45.89199812166353, -23.17590863560146],
            [-45.89548870808565, -23.175036229634145],
            [-45.894955282707855, -23.16893890559291],
            [-45.89685060369064, -23.16643538019892],
            [-45.90309072058267, -23.162864995162195],
          ],
        ],
        type: 'Polygon',
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 5,
        alt: 'Área 5',
        name: 'Área preservada do Campos de São José',
        description:
          'Área reservada na região leste do Campos de São José, onde possui vegetação preservadas.',
        fazenda: {
            nome: "Fazenda Recanto dos Pássaros",
            cidade: 'São José dos Campos',
            estado: 'São Paulo',
          },
      },
      geometry: {
        coordinates: [
          [
            [-45.814305614691676, -23.207466068631874],
            [-45.818990426018075, -23.20189374687652],
            [-45.82855199082141, -23.200456243965746],
            [-45.83455510385514, -23.199647771436716],
            [-45.84381367365805, -23.20487427329742],
            [-45.84563631445101, -23.20912586092203],
            [-45.83812250164945, -23.213553039941473],
            [-45.83848965855174, -23.216769289347795],
            [-45.83586493352317, -23.221306978925696],
            [-45.82929901810013, -23.22652399736748],
            [-45.82517723879499, -23.22187945060641],
            [-45.8138025893297, -23.208498001943127],
            [-45.814305614691676, -23.207466068631874],
          ],
        ],
        type: 'Polygon',
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 6,
        alt: 'Área 6',
        name: 'Reserva Florestal Vale Verde',
        description:
          'Área de preservação com vegetação nativa e fauna diversificada.',
        fazenda: {
          nome: "Fazenda Vale Verde",
          cidade: 'São José dos Campos',
          estado: 'São Paulo',
        },
      },
      geometry: {
        coordinates: [
          [
            [-45.860123, -23.140123],
            [-45.865456, -23.141789],
            [-45.868789, -23.145678],
            [-45.867890, -23.148123],
            [-45.860456, -23.147890],
            [-45.859123, -23.144567],
            [-45.860123, -23.140123],
          ],
        ],
        type: 'Polygon',
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 7,
        alt: 'Área 7',
        name: 'Bosque das Palmeiras',
        description:
          'Bosque com árvores nativas e áreas de lazer para visitantes.',
        fazenda: {
          nome: "Fazenda Bosque das Palmeiras",
          cidade: 'São José dos Campos',
          estado: 'São Paulo',
        },
      },
      geometry: {
        coordinates: [
          [
            [-45.875678, -23.130234],
            [-45.878901, -23.131890],
            [-45.882345, -23.133567],
            [-45.881567, -23.136123],
            [-45.877890, -23.135456],
            [-45.875678, -23.130234],
          ],
        ],
        type: 'Polygon',
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 8,
        alt: 'Área 8',
        name: 'Reserva Natural das Águas Claras',
        description:
          'Área com riachos e vegetação preservada, ideal para caminhadas.',
        fazenda: {
          nome: "Fazenda Águas Claras",
          cidade: 'São José dos Campos',
          estado: 'São Paulo',
        },
      },
      geometry: {
        coordinates: [
          [
            [-45.840789, -23.125890],
            [-45.843567, -23.126789],
            [-45.845678, -23.129012],
            [-45.843890, -23.131234],
            [-45.841123, -23.130567],
            [-45.840789, -23.125890],
          ],
        ],
        type: 'Polygon',
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 9,
        alt: 'Área 9',
        name: 'Mata Atlântica Conservada',
        description:
          'Área de mata atlântica com grande biodiversidade e trilhas ecológicas.',
        fazenda: {
          nome: "Fazenda Mata Atlântica",
          cidade: 'São José dos Campos',
          estado: 'São Paulo',
        },
      },
      geometry: {
        coordinates: [
          [
            [-45.890123, -23.150456],
            [-45.893567, -23.151890],
            [-45.896234, -23.153678],
            [-45.894567, -23.156234],
            [-45.891123, -23.155567],
            [-45.890123, -23.150456],
          ],
        ],
        type: 'Polygon',
      },
    },
    {
      type: 'Feature',
      properties: {
        id: 10,
        alt: 'Área 10',
        name: 'Sítio das Flores',
        description:
          'Sítio com cultivo de flores e área para eventos culturais.',
        fazenda: {
          nome: "Fazenda Sítio das Flores",
          cidade: 'São José dos Campos',
          estado: 'São Paulo',
        },
      },
      geometry: {
        coordinates: [
          [
            [-45.815678, -23.135567],
            [-45.818234, -23.137890],
            [-45.820456, -23.139567],
            [-45.819123, -23.142234],
            [-45.816567, -23.140890],
            [-45.815678, -23.135567],
          ],
        ],
        type: 'Polygon',
      },
    },
  ],
}

export default areasSJC;
