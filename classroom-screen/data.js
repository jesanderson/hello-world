// Lesson content for the classroom screen.
// Anything here can be overridden per day from the published Google Sheet.

var CLASS_INFO={
  teacher:"Anderson",room:"Room C131",subject:"6th Grade Literacy",
  unit:"Unit 2: You and Me",unitEs:"Unidad 2: Tú y yo",
  essentialQuestion:"How do relationships shape us?",essentialQuestionEs:"¿Cómo nos forman las relaciones?",
  seatingUrl:"https://docs.google.com/presentation/d/1VTIc-eAUqAbYAiEfaCqyJqNntfAWIvr_7w_qtuvAV8Q/edit?usp=sharing",
  planFolder:"https://drive.google.com/drive/folders/1riXzHCIt2zE8kgaTR1Neo77O0kEJO3p1",
  videoUrl:"https://www.youtube.com/watch?v=oOTlHbxVAAM",
  sheetCsvUrl:"https://docs.google.com/spreadsheets/d/1l6UHAtO9B4MJKXH2S3NCJmM6BIMF1BrUJl0vAkjvaMc/edit"
};

// Recorded sounds that replace the built-in ones, by soundboard id.
// Files go in classroom-screen/sounds/ (public domain or free-license only).
var SOUND_FILES={};

// Annotation Key. The Sheet's "Annotations" tab (columns symbol, label, labelEs, meaning, meaningEs) replaces these.
var ANNOTATIONS_DEFAULT=[
  {symbol:"?",label:"Question",labelEs:"Pregunta",meaning:"I have a question about this.",meaningEs:"Tengo una pregunta sobre esto."},
  {symbol:"!",label:"Surprise",labelEs:"Sorpresa",meaning:"This surprised me.",meaningEs:"Esto me sorprendió."},
  {symbol:"★",label:"Important",labelEs:"Importante",meaning:"This is a key idea.",meaningEs:"Esta es una idea clave."},
  {symbol:"◯",label:"New word",labelEs:"Palabra nueva",meaning:"Circle a word I don't know.",meaningEs:"Encierra una palabra que no conozco."},
  {symbol:"___",label:"Evidence",labelEs:"Evidencia",meaning:"Underline proof for an idea.",meaningEs:"Subraya la prueba de una idea."},
  {symbol:"♥",label:"Connection",labelEs:"Conexión",meaning:"This reminds me of something.",meaningEs:"Esto me recuerda algo."},
  {symbol:"→",label:"Prediction",labelEs:"Predicción",meaning:"I think this will happen next.",meaningEs:"Creo que esto va a pasar después."},
  {symbol:"☺",label:"Feeling",labelEs:"Sentimiento",meaning:"How a character feels.",meaningEs:"Cómo se siente un personaje."}
];

var SECTIONS=[
  {id:"101",period:"Period 1",start:"8:20",end:"9:18"},
  {id:"203",period:"Period 3",start:"10:55",end:"11:53"},
  {id:"804",period:"Period 4",start:"11:56",end:"12:54"},
  {id:"405",period:"Period 5",start:"12:57",end:"13:55"},
  {id:"506",period:"Period 6",start:"13:58",end:"14:56"}
];

// Same five blocks every day. Format: start-end minutes, English / Spanish, separated by |
var AGENDA_DEFAULT="0-5 Do Now / Para empezar|5-15 Mini lesson / Minilección|15-30 Activity / Actividad|30-55 Work time / Tiempo de trabajo|55-58 Wrap up / Cierre";

var VOICE_LEVELS=[
  {level:0,label:"Silent",es:"Silencio",desc:"No voices.",descEs:"Sin voces."},
  {level:1,label:"Whisper",es:"Susurro",desc:"Only if you need help.",descEs:"Solo si necesitas ayuda."},
  {level:2,label:"Table Talk",es:"Voz de mesa",desc:"Only your table can hear you.",descEs:"Solo tu mesa te escucha."},
  {level:3,label:"Presenter",es:"Presentador",desc:"The whole room can hear you.",descEs:"Todo el salón te escucha."},
  {level:4,label:"Outside",es:"Afuera",desc:"Outside voice. Never in class.",descEs:"Voz de afuera. Nunca en clase."}
];

var CARES=["Cooperation","Acceptance","Respect","Eagerness to Learn","Safety"];
var CARES_ES={"Cooperation":"Cooperación","Acceptance":"Aceptación","Respect":"Respeto","Eagerness to Learn":"Ganas de aprender","Safety":"Seguridad"};

// Rules and Routines ticker. The Sheet's "Rules" tab (columns rule, ruleEs) replaces these.
var RULES_DEFAULT=[
  {rule:"Enter quietly and start the Do Now.",ruleEs:"Entra en silencio y empieza el Para empezar."},
  {rule:"Bring your notebook, pencil, and Chromebook every day.",ruleEs:"Trae tu cuaderno, lápiz y Chromebook todos los días."},
  {rule:"Raise your hand to speak or to ask for help.",ruleEs:"Levanta la mano para hablar o pedir ayuda."},
  {rule:"Follow the voice level on the board.",ruleEs:"Sigue el nivel de voz del pizarrón."},
  {rule:"Chromebooks are for schoolwork only.",ruleEs:"El Chromebook es solo para trabajo escolar."},
  {rule:"Show CARES: Cooperation, Acceptance, Respect, Eagerness to Learn, Safety.",ruleEs:"Muestra CARES: Cooperación, Aceptación, Respeto, Ganas de aprender, Seguridad."},
  {rule:"Clean your space and push in your chair before you leave.",ruleEs:"Limpia tu lugar y mete tu silla antes de salir."}
];

// Used on any day where the Sheet or the lesson data leaves a field blank.
var DAY_DEFAULTS={
  doNow:"",doNowEs:"",doNowWhere:"notebook or any paper",doNowWhereEs:"cuaderno o cualquier papel",doNowMins:5,
  learningTarget:"",learningTargetEs:"",clo:"",cloEs:"",
  activity:"",activityEs:"",
  materials:"Notebook or any paper, Pencil, Chromebook for Google Classroom",
  materialsEs:"Cuaderno o cualquier papel, Lápiz, Chromebook para Google Classroom",
  criteriaMet:"What a finished, correct answer looks like",criteriaMetEs:"Cómo se ve una respuesta completa y correcta",
  criteriaApproaching:"Part of the task done correctly",criteriaApproachingEs:"Una parte de la tarea hecha correctamente",
  criteriaNotYet:"Not started, one piece only, or copied",criteriaNotYetEs:"Sin empezar, solo una parte, o copiado",
  wordBank:"",wordBankEs:"",
  grammar:"",grammarEs:"",grammarAnswer:"",
  exitQuestion:"",exitQuestionEs:"",
  slidesUrl:"",lessonPlanUrl:"",
  agenda:""
};

var STD={
'RL.6.1':'Cite textual evidence to support analysis of what the text says explicitly as well as inferences drawn from the text.',
'RL.6.2':'Determine a theme or central idea of a text and how it is conveyed through particular details; provide a summary of the text distinct from personal opinions or judgments.',
'RL.6.3':"Describe how a particular story's or drama's plot unfolds in a series of episodes as well as how the characters respond or change as the plot moves toward a resolution.",
'RL.6.4':'Determine the meaning of words and phrases as they are used in a text, including figurative and connotative meanings; analyze the impact of a specific word choice on meaning and tone.',
'RL.6.5':'Analyze how a particular sentence, chapter, scene, or stanza fits into the overall structure of a text and contributes to the development of the theme, setting, or plot.',
'RL.6.6':'Explain how an author develops the point of view of the narrator or speaker in a text.',
'RL.6.9':'Compare and contrast texts in different forms or genres (such as stories and poems) in terms of their approaches to similar themes and topics.',
'RL.6.10':'Read and comprehend literature, including stories, dramas, and poems, in the grades 6-8 text complexity band proficiently.',
'RI.6.1':'Cite textual evidence to support analysis of what the text says explicitly as well as inferences drawn from the text.',
'W.6.1':'Write arguments to support claims with clear reasons and relevant evidence.',
'W.6.1.a':'Introduce claim(s) and organize the reasons and evidence clearly.',
'W.6.1.b':'Support claim(s) with clear reasons and relevant evidence, using credible sources and demonstrating an understanding of the topic or text.',
'W.6.1.c':'Use words, phrases, and clauses to clarify the relationships among claim(s) and reasons.',
'W.6.1.d':'Establish and maintain a formal style.',
'W.6.1.e':'Provide a concluding statement or section that follows from the argument presented.',
'W.6.4':'Produce clear and coherent writing in which the development, organization, and style are appropriate to task, purpose, and audience.',
'W.6.5':'With some guidance and support from peers and adults, develop and strengthen writing as needed by planning, revising, editing, rewriting, or trying a new approach.',
'W.6.6':'Use technology, including the Internet, to produce and publish writing as well as to interact and collaborate with others.',
'W.6.9.a':'Apply grade 6 Reading standards to literature, such as comparing and contrasting texts in different forms or genres in terms of their approaches to similar themes and topics.',
'W.6.10':'Write routinely over extended time frames and shorter time frames for a range of tasks, purposes, and audiences.',
'L.6.1.a':'Ensure that pronouns are in the proper case (subjective, objective, possessive).',
'L.6.1.e':"Recognize variations from standard English in their own and others' writing and speaking, and use strategies to improve expression in conventional language.",
'L.6.2.b':'Spell correctly.',
'SL.6.1.a':'Come to discussions prepared, having read or studied required material, and refer to evidence on the topic, text, or issue.'
};

var U2=[
{n:1,dt:'2026-09-28',s:'Unit launch',f:'Unit launch. The big idea: How do relationships shape us?',fe:'Inicio de la unidad. La gran idea: ¿Cómo nos forman las relaciones?',l:'Day 01b Content Vocabulary; Day 03 Academic Vocabulary',st:['RL.6.10','W.6.1'],w:'bond, influence, mentor, legacy, empathy',we:'vínculo, influencia, mentor, legado, empatía'},
{n:2,dt:'2026-09-29',s:'Poetry as a genre',f:'Poetry as a genre. Meet the writing project prompt and the argument rubric.',fe:'La poesía como género. Conoce la pregunta del proyecto de escritura y la rúbrica de argumento.',l:'Day 02 Genre, Recognizing Genre (Poetry)',st:['RL.6.10','W.6.1'],w:'stanza, line, poet, poetic device',we:'estrofa, verso, poeta, recurso poético'},
{n:3,dt:'2026-09-30',s:'Walk Two Moons, First Read',f:'Walk Two Moons, First Read. Ask questions as you read.',fe:'Walk Two Moons, primera lectura. Haz preguntas mientras lees.',l:'Day 04 Skill Generating Questions; Day 05 First Read',st:['RL.6.1','RL.6.10'],w:'explicit, implicit, infer',we:'explícito, implícito, inferir'},
{n:4,dt:'2026-10-01',s:'Walk Two Moons, tone',f:'Walk Two Moons. Tone and audience.',fe:'Walk Two Moons. Tono y público.',l:'Day 06 Skill Language, Style, and Audience',st:['RL.6.4','RL.6.9'],w:'tone, perspective, oblivious, overshadow',we:'tono, perspectiva, sin darse cuenta, eclipsar'},
{n:5,dt:'2026-10-02',s:'Walk Two Moons, Close Read',f:'Walk Two Moons, Close Read. Use text evidence, then rewrite one moment of the story.',fe:'Walk Two Moons, lectura atenta. Usa evidencia del texto y luego reescribe un momento de la historia.',l:'Day 07 Skill Textual Evidence; Day 08 Close Read',st:['RL.6.1','RL.6.3'],w:'cite, textual evidence, analyze, insight',we:'citar, evidencia textual, analizar, comprensión'},
{n:6,dt:'2026-10-05',s:'Roll of Thunder, First Read',f:'Roll of Thunder, Hear My Cry, First Read.',fe:'Roll of Thunder, Hear My Cry, primera lectura.',l:'Day 09 First Read',st:['RL.6.2','RL.6.1'],w:'conflict, isolate, legacy',we:'conflicto, aislar, legado'},
{n:7,dt:'2026-10-06',s:'Roll of Thunder, word study',f:'Roll of Thunder. Connotation and denotation.',fe:'Roll of Thunder. Connotación y denotación.',l:'Day 10 Skill Connotation and Denotation',st:['RL.6.4','RL.6.1'],w:'connotation, denotation, context, tone',we:'connotación, denotación, contexto, tono'},
{n:8,dt:'2026-10-07',s:'Roll of Thunder, theme',f:'Roll of Thunder, Close Read. Find the theme.',fe:'Roll of Thunder, lectura atenta. Encuentra el tema.',l:'Day 11 Skill Theme; Day 13 Close Read',st:['RL.6.2','RL.6.1'],w:'theme, infer, summary, overshadow',we:'tema, inferir, resumen, eclipsar'},
{n:9,dt:'2026-10-08',s:'Roll of Thunder, structure. Quick check',f:'Roll of Thunder. Story structure, then write your side of the debate. Quick check today.',fe:'Roll of Thunder. Estructura del cuento y luego escribe tu postura en el debate. Revisión rápida hoy.',l:'Day 12 Skill Story Structure',st:['RL.6.5','RL.6.1','RL.6.3'],w:'plot, flashback, setting',we:'trama, escena retrospectiva, ambiente'},
{n:10,dt:'2026-10-19',s:'Teenagers, First Read',f:'Teenagers, First Read. Make inferences.',fe:'Teenagers, primera lectura. Haz inferencias.',l:'Day 14 Skill Making Inferences; Day 15 First Read',st:['RL.6.1','RL.6.4'],w:'inference, textual evidence, context',we:'inferencia, evidencia textual, contexto'},
{n:11,dt:'2026-10-20',s:'Teenagers, figurative language',f:'Teenagers. Figurative language.',fe:'Teenagers. Lenguaje figurado.',l:'Day 16 Skill Figurative Language',st:['RL.6.4','RL.6.1'],w:'metaphor, simile, personification, figure of speech',we:'metáfora, símil, personificación, figura retórica'},
{n:12,dt:'2026-10-21',s:'Teenagers, Close Read',f:'Teenagers, Close Read.',fe:'Teenagers, lectura atenta.',l:'Day 17 Close Read',st:['RL.6.4','RL.6.1'],w:'imagery, transform, dynamic, bond',we:'imágenes, transformar, dinámico, vínculo'},
{n:13,dt:'2026-10-22',s:'Teenagers, analysis write. Quick check',f:"Teenagers. Write how figurative language shows the speaker's character. Quick check today.",fe:'Teenagers. Escribe cómo el lenguaje figurado muestra cómo es el hablante. Revisión rápida hoy.',l:'No StudySync lesson. Writing task from the unit map',st:['RL.6.4','RL.6.1'],w:'isolate, tone, speaker',we:'aislar, tono, hablante'},
{n:14,dt:'2026-10-23',s:'Tableau, First Read',f:'Tableau, First Read. How a poem is built.',fe:'Tableau, primera lectura. Cómo se construye un poema.',l:'Day 18b Skill Adjusting Fluency; Day 19 First Read; Day 20 Skill Poetic Elements and Structure',st:['RL.6.5','RL.6.10'],w:'rhythm, meter, rhyme scheme, line break',we:'ritmo, métrica, esquema de rima, salto de verso'},
{n:15,dt:'2026-10-26',s:'Tableau, Close Read. Quick check',f:'Tableau, Close Read. Write how the stanzas build the theme of friendship. Quick check today.',fe:'Tableau, lectura atenta. Escribe cómo las estrofas construyen el tema de la amistad. Revisión rápida hoy.',l:'Day 21 Close Read',st:['RL.6.5','RL.6.2','RL.6.1'],w:'empathy, alliance, oblivious, perspective',we:'empatía, alianza, sin darse cuenta, perspectiva'},
{n:16,dt:'2026-10-27',s:'Writing project, Plan',f:'Argument writing project, Plan. Mark up the student model and read the rubric.',fe:'Proyecto de escritura argumentativa, planear. Anota el modelo del estudiante y lee la rúbrica.',l:'Writing Project Day 01 Plan',st:['W.6.1.a','W.6.4','W.6.5','RI.6.1'],w:'claim, reason, relevant evidence',we:'afirmación, razón, evidencia relevante'},
{n:17,dt:'2026-10-28',s:'The Circuit',f:'The Circuit, Independent Read and personal response.',fe:'The Circuit, lectura independiente y respuesta personal.',l:'Day 30 Independent Read',st:['RL.6.3','RL.6.1'],w:'mentor, motivate, sustain',we:'mentor, motivar, sostener'},
{n:18,dt:'2026-10-29',s:'Writing project, thesis',f:'Argument writing project, Draft. Organize your writing and write your thesis.',fe:'Proyecto de escritura argumentativa, borrador. Organiza tu escrito y escribe tu tesis.',l:'Writing Project Day 02 Organizing Argumentative Writing; Day 03 Thesis Statement',st:['W.6.1.a','W.6.10'],w:'thesis, organize, introduce',we:'tesis, organizar, introducir'},
{n:19,dt:'2026-11-02',s:'That Day',f:'That Day, Independent Read and personal response.',fe:'That Day, lectura independiente y respuesta personal.',l:'Day 31 Independent Read',st:['RL.6.4','RL.6.6'],w:'imagery, tone, emulate',we:'imágenes, tono, imitar'},
{n:20,dt:'2026-11-03',s:'Writing project, evidence',f:'Argument writing project, Draft. Reasons and evidence.',fe:'Proyecto de escritura argumentativa, borrador. Razones y evidencia.',l:'Writing Project Day 04 Reasons and Relevant Evidence; Day 05 Draft',st:['W.6.1.b','RL.6.1'],w:'credible, sufficient, support',we:'creíble, suficiente, apoyar'},
{n:21,dt:'2026-11-04',s:'A Poem for My Librarian, First Read',f:'A Poem for My Librarian, Mrs. Long, First Read. Compare and contrast.',fe:'A Poem for My Librarian, Mrs. Long, primera lectura. Comparar y contrastar.',l:'Day 32 First Read; Day 33 Skill Compare and Contrast',st:['RL.6.9','RL.6.1'],w:'compare, contrast, genre, paraphrase',we:'comparar, contrastar, género, parafrasear'},
{n:22,dt:'2026-11-05',s:'A Poem for My Librarian, Close Read',f:'A Poem for My Librarian, Close Read. Plan a theme comparison across three texts.',fe:'A Poem for My Librarian, lectura atenta. Planea una comparación del tema en tres textos.',l:'Day 34 Close Read',st:['RL.6.2','RL.6.9','RL.6.1'],w:'theme, evidence, reasoning',we:'tema, evidencia, razonamiento'},
{n:23,dt:'2026-11-06',s:'Compare essay practice 1',f:'Write the compare-and-contrast theme response. Unit test essay practice 1.',fe:'Escribe la respuesta de comparar y contrastar el tema. Práctica 1 del ensayo del examen.',l:'No StudySync lesson',st:['RL.6.2','RL.6.9','W.6.9.a'],w:'compare, contrast, cite, explain',we:'comparar, contrastar, citar, explicar'},
{n:24,dt:'2026-11-09',s:'Writing project, Revise',f:'Argument writing project, Revise. Introductions and transitions.',fe:'Proyecto de escritura argumentativa, revisar. Introducciones y transiciones.',l:'Writing Project Day 06 Introductions; Day 07 Transitions',st:['W.6.1.c','W.6.5'],w:'transition, clarify',we:'transición, aclarar'},
{n:25,dt:'2026-11-10',s:'Writing project, peer review',f:'Argument writing project, Revise. Style, conclusions, and peer review.',fe:'Proyecto de escritura argumentativa, revisar. Estilo, conclusiones y revisión entre compañeros.',l:'Writing Project Day 08 Style; Day 09 Conclusions; Day 10 Revise',st:['W.6.1.d','W.6.1.e','W.6.5','W.6.6'],w:'formal style, conclusion',we:'estilo formal, conclusión'},
{n:26,dt:'2026-11-11',s:'Writing project, Edit',f:'Argument writing project, Edit. Grammar block.',fe:'Proyecto de escritura argumentativa, editar. Bloque de gramática.',l:'Writing Project Day 11 Basic Spelling Rules I; Day 12 Possessive Pronouns; Day 13 Formal and Informal Language',st:['L.6.1.a','L.6.1.e','L.6.2.b','W.6.5'],w:'possessive, formal, informal',we:'posesivo, formal, informal'},
{n:27,dt:'2026-11-12',s:'Writing project, Publish',f:'Argument writing project, Publish to Google Classroom.',fe:'Proyecto de escritura argumentativa, publicar en Google Classroom.',l:'Writing Project Day 14 Edit and Publish',st:['W.6.6','W.6.10','SL.6.1.a'],w:'publish, revise',we:'publicar, revisar'},
{n:28,dt:'2026-11-16',s:'Compare essay practice 2',f:'Timed compare-and-contrast write, one story and one poem. Unit test essay practice 2.',fe:'Escritura cronometrada de comparar y contrastar, un cuento y un poema. Práctica 2 del ensayo del examen.',l:'No StudySync lesson',st:['RL.6.2','RL.6.9','RL.6.1'],w:'compare, contrast, narrative elements',we:'comparar, contrastar, elementos narrativos'},
{n:29,dt:'2026-11-17',s:'Skills review',f:'Skills review. Practice Part A and Part B evidence questions, dictionary questions, and stanza questions.',fe:'Repaso de destrezas. Practica preguntas de evidencia de la Parte A y la Parte B, preguntas de diccionario y preguntas de estrofas.',l:'Day 35 Analyze Genre; Day 35b Skill Vocabulary Review',st:['RL.6.1','RL.6.4','RL.6.5'],w:'Part A, Part B, best supports',we:'Parte A, Parte B, mejor apoya'},
{n:30,dt:'2026-11-18',s:'Unit 2 test, Day 1',f:'Unit 2 test, Day 1. Questions 1 through 12.',fe:'Examen de la Unidad 2, día 1. Preguntas 1 a 12.',l:'Unit 2 district assessment, questions 1 to 12',st:['RL.6.1','RL.6.2','RL.6.4','RL.6.5'],w:'',we:''},
{n:31,dt:'2026-11-19',s:'Unit 2 test, Day 2',f:'Unit 2 test, Day 2. Question 13 essay.',fe:'Examen de la Unidad 2, día 2. Ensayo de la pregunta 13.',l:'Unit 2 district assessment, question 13 essay',st:['RL.6.2','RL.6.9','W.6.9.a'],w:'',we:''},
{n:32,dt:'2026-11-20',s:'Results and reteach',f:'Look at our test results, practice what we missed, and get ready for Unit 3.',fe:'Revisamos los resultados del examen, practicamos lo que nos faltó y nos preparamos para la Unidad 3.',l:'No StudySync lesson',st:[],w:'',we:''}
];

var VOCAB={
'bond':{ph:'BOND',pos:'noun',d:'a close connection between people',de:'un vínculo, una conexión cercana entre personas',ex:'Sal and her mother had a strong bond, so losing her changed everything.'},
'influence':{ph:'IN-floo-uhns',pos:'noun or verb',d:'the power to change how someone thinks or acts',de:'el poder de cambiar cómo alguien piensa o actúa',ex:'A good coach can have a big influence on your future.'},
'mentor':{ph:'MEN-tor',pos:'noun',d:'a person who guides and teaches you',de:'una persona que te guía y te enseña',ex:'Mrs. Long was a mentor who helped the poet fall in love with books.'},
'legacy':{ph:'LEG-uh-see',pos:'noun',d:'what someone leaves behind for others',de:'lo que alguien deja para los demás',ex:"The Logan land is the family's legacy in Roll of Thunder, Hear My Cry."},
'empathy':{ph:'EM-puh-thee',pos:'noun',d:'understanding how someone else feels',de:'entender cómo se siente otra persona',ex:'Sal shows empathy when she notices Mrs. Winterbottom is sad.'},
'stanza':{ph:'STAN-zuh',pos:'noun',d:'a group of lines in a poem, like a paragraph',de:'una estrofa, un grupo de versos',ex:'The poem "Coach" has three stanzas.'},
'line':{ph:'LYNE',pos:'noun',d:'one row of words in a poem',de:'un verso, una línea de palabras en un poema',ex:'The last line of "Coach" shows the speaker still feels Coach beside her.'},
'poet':{ph:'POH-it',pos:'noun',d:'a person who writes poems',de:'una persona que escribe poemas',ex:'The poet of "Tableau" writes about two friends walking together.'},
'speaker':{ph:'SPEE-ker',pos:'noun',d:'the voice talking in a poem',de:'la voz que habla en el poema',ex:'The speaker in "Teenagers" is a parent watching her kids grow up.'},
'poetic device':{ph:'poh-ET-ik dih-VYSE',pos:'noun',d:'a tool poets use, like repetition, rhyme, or imagery',de:'un recurso poético, como la repetición, la rima o las imágenes',ex:'Repeating "me" at the end of lines is a poetic device in "Coach."'},
'explicit':{ph:'ik-SPLIS-it',pos:'adjective',d:'said directly in the text',de:'explícito, dicho directamente',ex:'It is explicit that Prudence is worried about cheerleading tryouts.'},
'implicit':{ph:'im-PLIS-it',pos:'adjective',d:'shown but not said directly',de:'implícito, mostrado pero no dicho directamente',ex:"Mrs. Winterbottom's sadness is implicit when she stares out the window."},
'infer':{ph:'in-FUR',pos:'verb',d:'to figure something out from clues',de:'inferir, deducir con pistas',ex:'We can infer that Sal misses her mother.'},
'crotchety':{ph:'KROCH-ih-tee',pos:'adjective',d:'cranky and in a bad mood',de:'malhumorado, gruñón',ex:'Phoebe was crotchety on the walk home from school.'},
'sullen':{ph:'SUL-in',pos:'adjective',d:'gloomy and not wanting to talk',de:'huraño, callado y de mal humor',ex:'Phoebe was sullen and would not explain why.'},
'agenda':{ph:'uh-JEN-duh',pos:'noun',d:'your own plans or things you care about',de:'agenda, tus propios planes o intereses',ex:'Prudence had her own agenda, so she did not see her mom was sad.'},
'assure':{ph:'uh-SHOOR',pos:'verb',d:'to promise or tell someone firmly',de:'asegurar, prometer',ex:'Prudence said she could assure everyone the tryouts mattered more.'},
'tone':{ph:'TOHN',pos:'noun',d:"the feeling a writer's words give off",de:'tono, el sentimiento que dan las palabras',ex:'The tone of the kitchen scene is sad and tense.'},
'perspective':{ph:'per-SPEK-tiv',pos:'noun',d:'how one person sees what is happening',de:'perspectiva, cómo una persona ve lo que pasa',ex:"Walk Two Moons is told from Sal's perspective."},
'oblivious':{ph:'uh-BLIV-ee-us',pos:'adjective',d:'not noticing what is right in front of you',de:'distraído, sin darse cuenta',ex:"Phoebe and Prudence are oblivious to their mother's sadness."},
'overshadow':{ph:'oh-ver-SHAD-oh',pos:'verb',d:'to make something seem less important',de:'eclipsar, hacer que algo parezca menos importante',ex:"Prudence lets her tryouts overshadow her mother's feelings."},
'cite':{ph:'SYTE',pos:'verb',d:'to quote the exact words from a text as proof',de:'citar, copiar las palabras exactas como prueba',ex:'Cite paragraph 22 to prove Sal notices Mrs. Winterbottom is sad.'},
'textual evidence':{ph:'TEKS-choo-ul EV-ih-dens',pos:'noun',d:'words from the text that prove your idea',de:'evidencia textual, palabras del texto que prueban tu idea',ex:'Your claim needs textual evidence with a paragraph number.'},
'analyze':{ph:'AN-uh-lyze',pos:'verb',d:'to look closely at the parts of something',de:'analizar, mirar de cerca las partes',ex:"We analyze how Sal's memories change what she notices."},
'insight':{ph:'IN-syte',pos:'noun',d:'a deep understanding of something',de:'comprensión profunda',ex:"Sal gains insight about her mom by watching Phoebe's family."},
'conflict':{ph:'KON-flikt',pos:'noun',d:'a problem or struggle in a story',de:'conflicto, un problema o lucha',ex:'The conflict in Roll of Thunder grows when the family faces unfair treatment.'},
'isolate':{ph:'EYE-suh-layt',pos:'verb',d:'to keep someone apart or alone',de:'aislar, separar o dejar solo',ex:'Keeping secrets can isolate people in a family.'},
'connotation':{ph:'kon-uh-TAY-shun',pos:'noun',d:'the feeling a word carries',de:'connotación, el sentimiento que lleva una palabra',ex:'The word stabbed has an angry connotation.'},
'denotation':{ph:'dee-noh-TAY-shun',pos:'noun',d:'the dictionary meaning of a word',de:'denotación, el significado de diccionario',ex:'The denotation of land is ground, but for the Logans it means much more.'},
'context':{ph:'KON-tekst',pos:'noun',d:'the words and ideas around a word that help explain it',de:'contexto, lo que rodea una palabra y ayuda a entenderla',ex:'Use context to figure out what crotchety means.'},
'theme':{ph:'THEEM',pos:'noun',d:'the message or lesson of a story, written as a sentence',de:'tema, el mensaje o la lección del texto',ex:'One theme is that family can protect you and limit you at the same time.'},
'summary':{ph:'SUM-uh-ree',pos:'noun',d:'a short retelling of the most important parts',de:'resumen, contar brevemente lo más importante',ex:'Write a summary of the chapter in three sentences.'},
'plot':{ph:'PLOT',pos:'noun',d:'the events that happen in a story, in order',de:'trama, los eventos de la historia en orden',ex:'The plot of Roll of Thunder moves toward a big conflict.'},
'flashback':{ph:'FLASH-bak',pos:'noun',d:'a scene that goes back to the past',de:'escena retrospectiva, una escena del pasado',ex:"Sal's memory of her mother is a flashback."},
'setting':{ph:'SET-ing',pos:'noun',d:'when and where a story happens',de:'ambiente, cuándo y dónde pasa la historia',ex:'The setting of Roll of Thunder is Mississippi in the 1930s.'},
'inference':{ph:'IN-fer-uns',pos:'noun',d:'an idea you figure out from clues',de:'inferencia, una idea que deduces con pistas',ex:'My inference is that the speaker misses her children.'},
'metaphor':{ph:'MET-uh-for',pos:'noun',d:'a comparison that says one thing is another',de:'metáfora, una comparación que dice que algo es otra cosa',ex:'Calling a closed door a wall is a metaphor.'},
'simile':{ph:'SIM-uh-lee',pos:'noun',d:'a comparison using like or as',de:'símil, una comparación con "como"',ex:'Phoebe was as sullen as a three-legged mule is a simile.'},
'personification':{ph:'per-son-uh-fih-KAY-shun',pos:'noun',d:'giving human traits to something not human',de:'personificación, dar rasgos humanos a algo que no es humano',ex:'The house held its breath is personification.'},
'figure of speech':{ph:'FIG-yer uv SPEECH',pos:'noun',d:'words used in a creative, not literal, way',de:'figura retórica, palabras usadas de forma no literal',ex:'Teenagers uses figures of speech to show how the parent feels.'},
'imagery':{ph:'IM-ij-ree',pos:'noun',d:'words that help you see, hear, or feel something',de:'imágenes, palabras que te ayudan a ver, oír o sentir',ex:'The poem uses imagery of a closed door.'},
'transform':{ph:'trans-FORM',pos:'verb',d:'to change completely',de:'transformar, cambiar por completo',ex:"Growing up can transform a parent and child's bond."},
'dynamic':{ph:'dy-NAM-ik',pos:'adjective',d:'changing, not staying the same',de:'dinámico, que cambia',ex:'The relationship in Teenagers is dynamic.'},
'rhythm':{ph:'RITH-um',pos:'noun',d:'the beat of words in a poem',de:'ritmo, el compás de las palabras',ex:'Read Tableau aloud to hear its rhythm.'},
'meter':{ph:'MEE-ter',pos:'noun',d:'a pattern of strong and weak beats in poetry',de:'métrica, patrón de sílabas fuertes y débiles',ex:'Tableau has a steady meter.'},
'rhyme scheme':{ph:'RYME skeem',pos:'noun',d:'the pattern of rhyming words at the ends of lines',de:'esquema de rima, el patrón de rimas',ex:'Mark the rhyme scheme of Tableau with letters.'},
'line break':{ph:'LYNE brayk',pos:'noun',d:'where a poet ends a line and starts a new one',de:'salto de verso, donde termina un verso',ex:'A line break can change how a sentence feels.'},
'alliance':{ph:'uh-LY-uns',pos:'noun',d:'a partnership between people',de:'alianza, una unión entre personas',ex:'The two friends in Tableau form an alliance.'},
'claim':{ph:'KLAYM',pos:'noun',d:'the main point you argue',de:'afirmación, la idea principal que defiendes',ex:'My claim is that relationships can shape your future.'},
'reason':{ph:'REE-zun',pos:'noun',d:'why your claim is true',de:'razón, por qué tu afirmación es verdad',ex:'My first reason is that mentors teach us new skills.'},
'relevant evidence':{ph:'REL-uh-vunt EV-ih-dens',pos:'noun',d:'proof that connects directly to your claim',de:'evidencia relevante, prueba que se conecta con tu afirmación',ex:'A quote about Mrs. Long is relevant evidence for a claim about mentors.'},
'motivate':{ph:'MOH-tuh-vayt',pos:'verb',d:'to give someone a reason to try',de:'motivar, dar ganas de intentar',ex:'Mr. Lema helps motivate Francisco to read.'},
'sustain':{ph:'suh-STAYN',pos:'verb',d:'to keep something going',de:'sostener, mantener',ex:'A strong bond can sustain you through hard changes.'},
'thesis':{ph:'THEE-sis',pos:'noun',d:'one sentence that states your claim and reasons',de:'tesis, una oración con tu afirmación y razones',ex:'Write your thesis about a person who shaped your future.'},
'organize':{ph:'OR-guh-nyze',pos:'verb',d:'to put ideas in an order that makes sense',de:'organizar, poner en orden',ex:'Organize your reasons from strongest to weakest.'},
'introduce':{ph:'in-truh-DOOS',pos:'verb',d:'to present something for the first time',de:'introducir, presentar por primera vez',ex:'Introduce your claim in the first paragraph.'},
'emulate':{ph:'EM-yuh-layt',pos:'verb',d:'to copy someone you admire',de:'imitar a alguien que admiras',ex:'Many kids emulate an older sibling.'},
'credible':{ph:'KRED-uh-bul',pos:'adjective',d:'believable and trustworthy',de:'creíble, confiable',ex:'Quotes from the text make your argument credible.'},
'sufficient':{ph:'suh-FISH-unt',pos:'adjective',d:'enough',de:'suficiente',ex:'One quote is not sufficient; add a second piece of evidence.'},
'support':{ph:'suh-PORT',pos:'verb',d:'to back up with proof',de:'apoyar, respaldar con pruebas',ex:'Support your claim with a line from The Circuit.'},
'compare':{ph:'kum-PAIR',pos:'verb',d:'to show how things are alike',de:'comparar, mostrar en qué se parecen',ex:'Compare how Sal and Francisco deal with change.'},
'contrast':{ph:'kun-TRAST',pos:'verb',d:'to show how things are different',de:'contrastar, mostrar en qué son diferentes',ex:'Contrast the story with the poem.'},
'genre':{ph:'ZHAHN-ruh',pos:'noun',d:'a type of writing, like poetry or fiction',de:'género, un tipo de texto',ex:'This unit focuses on the genre of poetry.'},
'paraphrase':{ph:'PAIR-uh-frayz',pos:'verb',d:'to say something in your own words',de:'parafrasear, decir con tus palabras',ex:'Paraphrase the stanza about Mrs. Long.'},
'evidence':{ph:'EV-ih-dens',pos:'noun',d:'proof from the text',de:'evidencia, prueba del texto',ex:"Find evidence that the librarian changed the poet's life."},
'reasoning':{ph:'REE-zun-ing',pos:'noun',d:'explaining how your evidence proves your claim',de:'razonamiento, explicar cómo la evidencia prueba tu idea',ex:'Your reasoning connects the quote to the theme.'},
'explain':{ph:'ik-SPLAYN',pos:'verb',d:'to make clear why or how',de:'explicar, dejar claro por qué o cómo',ex:"Explain how both texts show a mentor's influence."},
'transition':{ph:'tran-ZISH-un',pos:'noun',d:'a word or phrase that connects ideas',de:'transición, palabra que conecta ideas',ex:'For example is a transition that brings in evidence.'},
'clarify':{ph:'KLAIR-uh-fy',pos:'verb',d:'to make clearer',de:'aclarar',ex:'Clarify how your second reason connects to your claim.'},
'formal style':{ph:'FOR-mul STYLE',pos:'noun',d:'serious, school-ready language with no slang',de:'estilo formal, lenguaje serio sin jerga',ex:'Use formal style in your argument essay.'},
'conclusion':{ph:'kun-KLOO-zhun',pos:'noun',d:'the ending that wraps up your argument',de:'conclusión, el final que cierra tu argumento',ex:'Your conclusion restates your claim in new words.'},
'possessive':{ph:'puh-ZES-iv',pos:'adjective',d:'showing that something belongs to someone',de:'posesivo, que muestra a quién pertenece algo',ex:'His and their are possessive pronouns.'},
'formal':{ph:'FOR-mul',pos:'adjective',d:'serious and polite, for school or work',de:'formal, serio y cortés',ex:'Write the essay in formal language.'},
'informal':{ph:'in-FOR-mul',pos:'adjective',d:'casual, like talking with friends',de:'informal, casual',ex:'Gonna is informal, so change it to going to.'},
'publish':{ph:'PUB-lish',pos:'verb',d:'to share finished writing',de:'publicar, compartir el trabajo final',ex:'Publish your essay to Google Classroom.'},
'revise':{ph:'rih-VYZE',pos:'verb',d:'to improve your writing by changing ideas or words',de:'revisar, mejorar tu escrito',ex:'Revise your introduction to make your claim clearer.'},
'narrative elements':{ph:'NAIR-uh-tiv EL-uh-ments',pos:'noun',d:'the parts of a story, like character, setting, and plot',de:'elementos narrativos, las partes de un cuento',ex:'Compare the narrative elements in the story and the poem.'},
'Part A':{ph:'PART AY',pos:'noun',d:'the first question in a two-part test item',de:'Parte A, la primera pregunta',ex:'Answer Part A before looking for evidence in Part B.'},
'Part B':{ph:'PART BEE',pos:'noun',d:'the question that asks for evidence for Part A',de:'Parte B, pide evidencia para la Parte A',ex:'Part B asks which line best supports your answer.'},
'best supports':{ph:'BEST suh-PORTS',pos:'phrase',d:'gives the strongest proof',de:'mejor apoya, da la prueba más fuerte',ex:'Pick the quote that best supports the theme.'}
};

var DETAIL={
1:{lessonPlanUrl:'https://docs.google.com/document/d/1QMPo3ZBESbhMlruNYw1sKrR0xXFJXJOqR6Eqy7f0xPM/edit',slidesUrl:'https://docs.google.com/presentation/d/15oLU9uRMs6bLMacfp-EF3Be52WxPNzb2tSp7WE2GNX0/edit',
doNow:'Think of one person who changed something about you. Write their name. Then write one thing they did or said.',
doNowEs:'Piensa en una persona que cambió algo en ti. Escribe su nombre. Luego escribe algo que hizo o dijo.',
learningTarget:'I can use 3 unit words to describe someone who shaped me.',
learningTargetEs:'Puedo usar 3 palabras de la unidad para describir a alguien que me formó.',
clo:'I will explain how someone changed me by using the unit words bond, influence, and mentor in the frame "___ is my mentor because ___."',
cloEs:'Voy a explicar cómo alguien me cambió usando las palabras de la unidad bond (vínculo), influence (influencia) y mentor en la frase "___ es mi mentor porque ___."',
activity:'Write 3 sentences about the person from your Do Now. Use a different unit word in each one.',
activityEs:'Escribe 3 oraciones sobre la persona de tu Para empezar. Usa una palabra diferente de la unidad en cada una.',
exitQuestion:"Open today's exit ticket in Google Classroom. Two word questions and How well do I understand today?",
exitQuestionEs:'Abre el boleto de salida de hoy en Google Classroom. Dos preguntas de palabras y ¿qué tan bien entiendo lo de hoy?'},
2:{lessonPlanUrl:'https://docs.google.com/document/d/1Twpg77DTq5d7t_B2g88Qludm2P4cVKCJsOR8k9JZ5Y0/edit',slidesUrl:'https://docs.google.com/presentation/d/1DYqsvUx1MX2hozAuPZv7LXJgwpLHMa9BlKucXqgf-Qg/edit',
doNow:'Go to Google Classroom. Log in to Quill using Clever. Begin the Baseline Pre Diagnostic. You do not have to finish it today.',
doNowEs:'Ve a Google Classroom. Inicia sesión en Quill con Clever. Empieza el Baseline Pre Diagnostic. No tienes que terminarlo hoy.',
doNowWhere:'Chromebook',doNowWhereEs:'Chromebook',
learningTarget:'I can find a line, a stanza, and a poetic device, and I can state my claim.',
learningTargetEs:'Puedo encontrar un verso, una estrofa y un recurso poético, y puedo decir mi afirmación.',
clo:'I will examine a poem by labeling its lines, stanzas, and speaker in the frame "The poem has ___ stanzas. The speaker is ___."',
cloEs:'Voy a examinar un poema marcando sus versos, estrofas y hablante en la frase "El poema tiene ___ estrofas. El hablante es ___."',
activity:'Label the poem "Coach": lines, stanzas, speaker, one poetic device, and the legacy Coach left. Then meet our unit essay.',
activityEs:'Marca en el poema "Coach" los versos, las estrofas, el hablante, un recurso poético y el legado que dejó Coach. Luego conoce el ensayo de la unidad.',
wordBank:'line, stanza, speaker, poetic device',wordBankEs:'verso, estrofa, hablante, recurso poético',
exitQuestion:"Open today's exit ticket in Google Classroom. What is a stanza? What legacy did Coach leave?",
exitQuestionEs:'Abre el boleto de salida de hoy en Google Classroom. ¿Qué es una estrofa? ¿Qué legado dejó Coach?'},
3:{lessonPlanUrl:'https://docs.google.com/document/d/1JxPmxOD54xgIGjM8onABz5OO2ziLbJkwpWQ8KhPRD00/edit',slidesUrl:'https://docs.google.com/presentation/d/1uPoBefDlqTNuawTbxi-oTi1pItrYGUB3LLnUjqXpR2Y/edit',
doNow:'Maya slammed her locker and walked past her best friend without a word. How does Maya feel? Does the sentence SAY it or SHOW it?',
doNowEs:'Maya cerró su casillero de golpe y pasó junto a su mejor amiga sin decir nada. ¿Cómo se siente Maya? ¿La oración lo DICE o lo MUESTRA?',
learningTarget:'I can find a line that shows a feeling, and explain it.',
learningTargetEs:'Puedo encontrar una oración que muestra un sentimiento y explicarla.',
clo:'I will infer how a character feels by quoting one line in the frame "___ feels ___ because the text says \'___\' (paragraph ___)."',
cloEs:'Voy a inferir cómo se siente un personaje citando una oración en la frase "___ se siente ___ porque el texto dice \'___\' (párrafo ___)."',
activity:'First Read of Walk Two Moons in StudySync. Stop after paragraphs 3, 16, 25, and 36 and write one question each time.',
activityEs:'Primera lectura de Walk Two Moons en StudySync. Para después de los párrafos 3, 16, 25 y 36 y escribe una pregunta cada vez.',
wordBank:'explicit, implicit, infer, crotchety, sullen, agenda, assure',wordBankEs:'explícito, implícito, inferir, malhumorado, huraño, agenda, asegurar',
exitQuestion:"Open today's exit ticket in Google Classroom. Is Mrs. Winterbottom's feeling in paragraph 10 explicit or implicit?",
exitQuestionEs:'Abre el boleto de salida de hoy en Google Classroom. ¿El sentimiento de la Sra. Winterbottom en el párrafo 10 es explícito o implícito?'},
4:{lessonPlanUrl:'https://docs.google.com/document/d/1w2smyjJ62URIvSwpgYaX5tkx14FbTkMvG5eJ2v7EPGI/edit',slidesUrl:'https://docs.google.com/presentation/d/1-awCp_f4Y3f9zQ3NtbiUK6sOAgVk8J566sXRFc11hjk/edit',
doNow:'"Oh sweetie," she whispered, hugging him. "Oh sweetie," she sighed, rolling her eyes. What is the tone of each one? Which words changed it?',
doNowEs:'"Ay, cariño", susurró ella mientras lo abrazaba. "Ay, cariño", suspiró ella y puso los ojos en blanco. ¿Cuál es el tono de cada una? ¿Qué palabras lo cambiaron?',
learningTarget:'I can name the tone of a line and point to the words that create it.',
learningTargetEs:'Puedo nombrar el tono de una oración y señalar las palabras que lo crean.',
clo:'I will compare two lines to find the tone of each by using the frame "The word ___ makes the tone ___."',
cloEs:'Voy a comparar dos oraciones para encontrar el tono de cada una usando la frase "La palabra ___ hace que el tono sea ___."',
activity:'Match three lines from Walk Two Moons (paragraphs 15, 22, 31) to a tone. Name the words that create it. Who is oblivious?',
activityEs:'Empareja tres oraciones de Walk Two Moons (párrafos 15, 22 y 31) con un tono. Nombra las palabras que lo crean. ¿Quién no se da cuenta?',
wordBank:'tone, perspective, oblivious, overshadow',wordBankEs:'tono, perspectiva, sin darse cuenta, eclipsar',
exitQuestion:"Open today's exit ticket in Google Classroom. What does oblivious mean? Which line shows the daughters are oblivious?",
exitQuestionEs:'Abre el boleto de salida de hoy en Google Classroom. ¿Qué significa oblivious? ¿Qué oración muestra que las hijas no se dan cuenta?'},
5:{lessonPlanUrl:'https://docs.google.com/document/d/1VK5C9-pQchN3v8NPxoGKqOTdJDxzVcRMSvB2EwiXsOQ/edit',slidesUrl:'https://docs.google.com/presentation/d/1SSLcU558jUq7NkVMXXTbFuHfEksC7ou0lbdq0HqsctI/edit',
doNow:'Claim: Mrs. Winterbottom is sad. Which line proves it best? Pick one, then write why the others are weaker.',
doNowEs:'Afirmación: La Sra. Winterbottom está triste. ¿Qué oración lo prueba mejor? Escoge una y luego escribe por qué las otras son más débiles.',
learningTarget:'I can quote a line, explain it, and use it in a claim.',
learningTargetEs:'Puedo citar una oración, explicarla y usarla en una afirmación.',
clo:'I will choose the line that best proves what Sal notices and support it with the frame "This line proves ___ because ___."',
cloEs:'Voy a escoger la oración que mejor prueba lo que nota Sal y apoyarla con la frase "Esta oración prueba ___ porque ___."',
activity:'Close Read write: retell the kitchen scene as Phoebe, Prudence, or Mrs. Winterbottom. Start: My name is ___. When I ___, I felt ___.',
activityEs:'Escritura de lectura atenta: vuelve a contar la escena de la cocina como Phoebe, Prudence o la Sra. Winterbottom. Empieza así: Me llamo ___. Cuando ___, me sentí ___.',
exitQuestion:'Open the Friday check in Google Classroom. Copy the line that best shows what Sal notices about Mrs. Winterbottom, then explain it.',
exitQuestionEs:'Abre la revisión del viernes en Google Classroom. Copia la oración que mejor muestra lo que nota Sal sobre la Sra. Winterbottom y luego explícala.'}
};

// Columns in the Google Sheet, in order. The Sheet only needs the ones you use.
var SHEET_COLUMNS=["day","date","topic","doNow","doNowEs","doNowWhere","doNowWhereEs","doNowMins",
"learningTarget","learningTargetEs","clo","cloEs","standards","activity","activityEs","materials","materialsEs",
"criteriaMet","criteriaMetEs","criteriaApproaching","criteriaApproachingEs","criteriaNotYet","criteriaNotYetEs",
"wordBank","wordBankEs","grammar","grammarEs","grammarAnswer","exitQuestion","exitQuestionEs",
"slidesUrl","lessonPlanUrl","videoUrl","agenda"];

// Builds one day's content from everything above (no Sheet yet).
function baseDay(n){
  var u=null;for(var i=0;i<U2.length;i++){if(U2[i].n===n){u=U2[i];break;}}
  if(!u)return null;
  var out={};for(var k in DAY_DEFAULTS)out[k]=DAY_DEFAULTS[k];
  out.day=n;out.date=u.dt;out.topic=u.s;out.activity=u.f;out.activityEs=u.fe;out.studysync=u.l;
  out.standards=u.st.join(", ");out.wordBank=u.w;out.wordBankEs=u.we;
  out.lessonPlanUrl=CLASS_INFO.planFolder;
  var d=DETAIL[n]||{};for(var j in d)out[j]=d[j];
  return out;
}

if(typeof module!=="undefined")module.exports={CLASS_INFO:CLASS_INFO,U2:U2,SHEET_COLUMNS:SHEET_COLUMNS,baseDay:baseDay};
