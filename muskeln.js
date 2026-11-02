/* =========================================================================
   Muskel-Lexikon – verständlich erklärt, passend zu den Muskelgruppen der App.
   Wird nach app.js geladen und hängt sich über SCREENS in die Navigation ein.
   ========================================================================= */

ICONS.book = '<path d="M12 6.5C10.5 5 8 4.5 4.5 4.5v13c3.5 0 6 .5 7.5 2 1.5-1.5 4-2 7.5-2v-13c-3.5 0-6 .5-7.5 2zM12 6.5v13"/>';

const MUSKEL_LEX = [
  {
    id: 'Brust', nick: 'Pecs', tag: 'Drücken, Stoßen, Umarmen.',
    kurz: `Dein großer Brustmuskel ist ein Fächer, der vom Brustbein und Schlüsselbein zum Oberarm läuft. Er bringt den Arm nach vorn und zur Körpermitte – alles, was du wegdrückst, läuft über ihn.`,
    muskeln: [
      ['Großer Brustmuskel', 'Pectoralis major', `Der Chef der Brust. Die oberen Fasern (vom Schlüsselbein) arbeiten beim Schrägbankdrücken stärker, die mittleren beim Flachbankdrücken, die unteren bei Dips und Negativbankdrücken. Zusammen: Arm vor den Körper führen, drücken, zur Mitte ziehen.`],
      ['Kleiner Brustmuskel', 'Pectoralis minor', `Liegt unter dem großen und hält das Schulterblatt vorn unten. Ist er verkürzt (viel Schreibtisch, viel Handy), hängen die Schultern nach vorn.`],
      ['Vorderer Sägemuskel', 'Serratus anterior', `Der Muskel mit den „Zacken“ seitlich an den Rippen. Er schiebt die Schulterblätter nach vorn und hält sie am Brustkorb – wichtig für gesunde Schultern beim Drücken. Bei Liegestützen oben die Schulterblätter bewusst auseinanderschieben.`]
    ],
    gegen: `Rücken (Latissimus, Rhomboiden). Wer nur drückt, zieht die Schultern nach vorn – zieh etwa so viel, wie du drückst.`,
    alltag: `Türen aufdrücken, dich vom Boden hochstemmen, etwas wegschieben, werfen, jemanden umarmen.`,
    fun: [
      `Beim Bankdrücken arbeitet die Brust nie allein: vordere Schulter und Trizeps helfen immer mit. Brust + Schulter vorn + Trizeps = das klassische „Push“-Team.`,
      `Der Brustmuskel hat zwei Ursprünge (Schlüsselbein und Brustbein/Rippen). Deshalb verschiebt der Bankwinkel, welcher Teil mehr Arbeit abbekommt.`,
      `Bei Fliegenden wird die Brust unten am stärksten gedehnt. Training in der gedehnten Position gilt als besonders gut fürs Wachstum.`
    ],
    fehler: [
      `Schultern nach vorn rollen – Schulterblätter zusammen und nach unten ziehen, Brust raus.`,
      `Die Stange von der Brust abprallen lassen – kontrolliert absenken, kurz die Spannung halten.`,
      `Ellbogen im 90°-Winkel weit abspreizen – etwa 45–70° zum Körper sind schulterfreundlicher.`
    ],
    tipp: `Leg Fliegende (Pec Fly, Cable Crossover) ans Ende: Nach den schweren Drückübungen hat die Brust noch Power, die Schulter wird aber geschont.`
  },
  {
    id: 'Schulter', nick: 'Delts', tag: 'Breite, die man von vorn und hinten sieht.',
    kurz: `Der Deltamuskel besteht aus drei Köpfen, die wie eine Kappe um das Schultergelenk liegen. Er hebt den Arm in jede Richtung – und macht dich optisch breiter.`,
    muskeln: [
      ['Vorderer Delta', 'Deltoideus, Pars clavicularis', `Hebt den Arm nach vorn. Arbeitet bei jedem Drücken kräftig mit (Bankdrücken, Überkopfdrücken) – bei den meisten ist er deshalb schon gut im Training.`],
      ['Seitlicher Delta', 'Deltoideus, Pars acromialis', `Hebt den Arm zur Seite. Der „Breitmacher“: Seitheben ist die Übung, die dich in der Frontansicht breiter wirken lässt.`],
      ['Hinterer Delta', 'Deltoideus, Pars spinalis', `Zieht den Arm nach hinten und außen. Wird gern vergessen, hält aber die Schultern aufrecht. Face Pulls und Reverse Butterfly treffen ihn.`],
      ['Rotatorenmanschette', 'Supraspinatus, Infraspinatus, Teres minor, Subscapularis', `Vier kleine Muskeln, die den Oberarmkopf wie ein Gummiband in der Gelenkpfanne halten. Das Schultergelenk ist das beweglichste des Körpers – und braucht deshalb diese Stabilisatoren. Face Pulls und leichte Außenrotation halten sie fit.`]
    ],
    gegen: `Vorderer ↔ hinterer Delta. Die meisten drücken viel und ziehen zu wenig nach hinten – Face Pulls und Reverse Butterfly gleichen das aus.`,
    alltag: `Etwas ins Regal heben, den Koffer in die Gepäckablage, Arme zur Seite strecken, Rucksack tragen.`,
    fun: [
      `Schulterbreite kommt vor allem vom seitlichen Delta – und der bekommt beim Drücken kaum Arbeit. Deshalb gibt es extra Seitheben.`,
      `Das Schultergelenk hat den größten Bewegungsspielraum aller Gelenke – dafür kugelt es sich auch am häufigsten aus.`,
      `Seitheben geht mit leichten Gewichten: Gefühl und Kontrolle bringen hier mehr als Kilos.`
    ],
    fehler: [
      `Beim Seitheben schwingen und mit dem Trapez hochziehen – Schultern unten lassen, die Ellbogen führen.`,
      `Aufrechtes Rudern mit Ellbogen weit über Schulterhöhe – wenn es im Gelenk zwickt, Griff breiter oder Übung wechseln.`,
      `Überkopfdrücken im Hohlkreuz – Bauch und Po anspannen, Rippen nach unten.`
    ],
    tipp: `Seitheben gern an den Anfang der Einheit und mit höheren Wiederholungen (12–20) – vor allem, wenn der seitliche Delta bei dir zurückbleibt.`
  },
  {
    id: 'Trizeps', nick: 'Der Streckmuskel', tag: 'Der größte Teil deines Oberarms.',
    kurz: `Der Trizeps liegt an der Rückseite des Oberarms und streckt den Ellbogen. Er macht den größten Teil deiner Oberarmmasse aus – wer dicke Arme will, trainiert vor allem ihn, nicht den Bizeps.`,
    muskeln: [
      ['Langer Kopf', 'Caput longum', `Entspringt am Schulterblatt und läuft damit über zwei Gelenke. Bei Überkopf-Varianten (Overhead Push, French Press) wird er am stärksten gedehnt – und das mag er fürs Wachstum.`],
      ['Seitlicher Kopf', 'Caput laterale', `Der sichtbare „Hufeisen“-Teil außen am Arm. Springt bei schwerem Drücken an: Enges Bankdrücken, Dips, Pushdowns.`],
      ['Mittlerer Kopf', 'Caput mediale', `Liegt tief unter den anderen und hilft immer mit, sobald der Ellbogen streckt – auch bei leichten Lasten.`]
    ],
    gegen: `Bizeps. Am Ellbogen arbeiten die beiden gegeneinander: Bizeps beugt, Trizeps streckt.`,
    alltag: `Alles, was du wegdrückst oder abstützt: aus dem Sitzen hochdrücken, Tür aufstoßen, etwas über den Kopf heben.`,
    fun: [
      `„Tri-ceps“ heißt dreiköpfig, „Bi-ceps“ zweiköpfig – der Name sagt schon, wie viele Köpfe sie haben.`,
      `Beim Bankdrücken scheitert oft der Trizeps, nicht die Brust. Ein starker Trizeps bringt mehr Gewicht auf die Stange.`,
      `Für den langen Kopf sind Überkopf-Übungen besonders gut, weil er dort in die Dehnung kommt.`
    ],
    fehler: [
      `Beim Pushdown die Ellbogen nach vorn und hinten wandern lassen – Ellbogen eng am Körper festnageln.`,
      `Mit Schwung und dem Oberkörper drücken – Gewicht runter, Bewegung sauber.`,
      `Ellbogen bei French Press weit nach außen – möglichst parallel halten, das schont die Gelenke.`
    ],
    tipp: `Kombiniere eine Überkopf-Übung (Overhead Push) mit einer Pushdown-Variante – dann kommen alle drei Köpfe gut dran.`
  },
  {
    id: 'Bizeps', nick: 'Der Poser-Muskel', tag: 'Beugen und Drehen.',
    kurz: `Der Bizeps beugt den Ellbogen und dreht die Handfläche nach oben (Supination). Er ist der Muskel, den jeder zeigt – aber nur ein Teil der Armvorderseite.`,
    muskeln: [
      ['Zweiköpfiger Armmuskel', 'Biceps brachii', `Langer Kopf (außen) und kurzer Kopf (innen). Beugt den Ellbogen, dreht den Unterarm nach außen (wie ein Korkenzieher) und hilft ein bisschen beim Heben des Arms nach vorn.`],
      ['Oberarmmuskel', 'Brachialis', `Liegt unter dem Bizeps und ist der eigentliche Arbeits-Beuger im Ellbogen. Wächst er, schiebt er den Bizeps nach oben – der Arm wirkt dicker. Hammer Curls treffen ihn besonders.`],
      ['Oberarmspeichenmuskel', 'Brachioradialis', `Sitzt am Unterarm neben dem Ellbogen und hilft beim Beugen, vor allem mit neutralem Griff oder Obergriff (Hammer Curls, Reverse Curls).`]
    ],
    gegen: `Trizeps. Bizeps beugt, Trizeps streckt – für ausgewogene Arme beide trainieren.`,
    alltag: `Tasche tragen, Kiste hochheben, Klimmzug, Schraubverschluss aufdrehen.`,
    fun: [
      `Beim Klimmzug im Untergriff arbeitet der Bizeps richtig mit – deshalb bekommt er auch von Rückenübungen etwas ab.`,
      `Der Bizeps kann den Unterarm drehen. Kurzhantel-Curls mit Drehung sind deshalb ein anderer Reiz als Langhantel-Curls.`,
      `Er läuft über zwei Gelenke (Schulter und Ellbogen) – bei Schräghantelbank-Curls wird er dadurch besonders stark gedehnt.`
    ],
    fehler: [
      `Mit dem Rücken schwingen (Cheat Curls) – Rücken stabil, Ellbogen vorn fixieren.`,
      `Nur halbe Bewegung – unten ganz strecken, oben ganz beugen.`,
      `Gewicht zu schwer: Wenn der Rücken mithilft, ist es zu viel.`
    ],
    tipp: `Lass das Gewicht langsam runter (2–3 Sekunden). Und vergiss den Brachialis nicht: Hammer Curls machen den Arm dicker.`
  },
  {
    id: 'Rücken', nick: 'Das Fundament', tag: 'Breit von vorn, stabil von hinten.',
    kurz: `Der Rücken ist die größte Muskelgruppe deines Oberkörpers und besteht aus mehreren Schichten. Er zieht, hält dich aufrecht und überträgt Kraft zwischen Beinen und Armen.`,
    muskeln: [
      ['Breiter Rückenmuskel', 'Latissimus dorsi', `Der große Flügel seitlich am Rücken. Zieht den Arm von oben nach unten und hinten (Latzug, Klimmzug) und macht die V-Form: breit oben, schmal in der Taille.`],
      ['Kapuzenmuskel', 'Trapezius', `Die Raute vom Nacken bis zur Mitte des Rückens. Der obere Teil hebt die Schultern (Shrugs), der mittlere zieht die Schulterblätter zusammen, der untere nach unten.`],
      ['Rautenmuskeln', 'Rhomboideen', `Liegen zwischen den Schulterblättern und ziehen sie zusammen. Wichtig fürs Rudern und gegen einen Rundrücken.`],
      ['Rückenstrecker', 'Erector spinae', `Zwei Muskelstränge links und rechts der Wirbelsäule. Sie richten dich auf und halten den Rücken bei Kreuzheben und Kniebeugen stabil. Der „untere Rückenstrecker“ in deinem Katalog trainiert genau sie.`],
      ['Großer Rundmuskel', 'Teres major', `Der „kleine Bruder“ des Latissimus – er unterstützt ihn beim Ziehen.`]
    ],
    gegen: `Brust (und vorderer Delta). Lieber etwas mehr ziehen als drücken – das hält die Schultern gesund.`,
    alltag: `Etwas zu dir ziehen, Rucksack tragen, Gepäck heben, aufrecht sitzen, aus gebückter Haltung aufstehen.`,
    fun: [
      `Der Latissimus ist flächenmäßig der größte Muskel des Oberkörpers.`,
      `Beim Ziehen: Denk „Ellbogen zu den Hosentaschen“. Wer die Ellbogen führt statt der Hände, spürt den Lat besser.`,
      `Kreuzheben trainiert fast die ganze Rückseite des Körpers: Rücken, Po, Beinbeuger und Unterarme.`
    ],
    fehler: [
      `Mit den Armen statt mit dem Rücken ziehen – erst die Schulterblätter bewegen, dann folgen die Arme.`,
      `Beim Kreuzheben mit rundem Rücken heben – neutraler Rücken, Stange nah am Körper.`,
      `Zu viel Schwung beim Rudern – Oberkörper ruhig halten oder Chest Supported Rudern nutzen.`
    ],
    tipp: `Wechsle zwischen Vertikal (Latzug, Klimmzug) und Horizontal (Rudern). Das eine macht den Rücken breit, das andere dick.`
  },
  {
    id: 'Beine', nick: 'Die Motoren', tag: 'Die größten Muskeln deines Körpers.',
    kurz: `Beine und Po sind die größte Muskelmasse im Körper. Sie tragen dich, treiben dich an und sind die Basis für Kraft in fast jeder Sportart.`,
    muskeln: [
      ['Vierköpfiger Oberschenkelmuskel', 'Quadrizeps', `Die Vorderseite des Oberschenkels, vier Köpfe, streckt das Knie. Kniebeugen, Beinpresse, Beinstrecker, Ausfallschritte.`],
      ['Beinbeuger', 'Hamstrings: Biceps femoris, Semitendinosus, Semimembranosus', `Die Rückseite des Oberschenkels: beugen das Knie und strecken die Hüfte. Rumänisches Kreuzheben (viel Dehnung!) und Beinbeuger-Maschine sind die besten Übungen.`],
      ['Großer Gesäßmuskel', 'Gluteus maximus', `Der größte Muskel des Körpers. Streckt die Hüfte: aufstehen, Treppen steigen, sprinten, Hüftstoßen.`],
      ['Mittlerer und kleiner Gesäßmuskel', 'Gluteus medius / minimus', `Sitzen seitlich am Becken. Führen das Bein zur Seite und halten das Becken stabil beim Gehen und Laufen (Abduktoren-Maschine).`],
      ['Adduktoren', 'Adduktorengruppe', `Die Innenseite des Oberschenkels. Ziehen die Beine zusammen und stabilisieren Becken und Knie – bei tiefen Kniebeugen stark beteiligt.`],
      ['Wadenmuskeln', 'Gastrocnemius & Soleus', `Der zweiköpfige Wadenmuskel (Gastrocnemius) arbeitet vor allem bei gestrecktem Knie – stehendes Wadenheben. Der Schollenmuskel (Soleus) darunter wird bei gebeugtem Knie wichtiger – sitzendes Wadenheben. Deshalb beides trainieren.`]
    ],
    gegen: `Quadrizeps ↔ Beinbeuger. Starke Beinbeuger stabilisieren das Knie – nicht nur Beinstrecker machen.`,
    alltag: `Treppen, aufstehen, rennen, hinsetzen, Einkauf tragen, Radfahren – ohne starke Beine geht nichts.`,
    fun: [
      `Der Gluteus maximus ist nach Masse der größte Muskel des Körpers.`,
      `Beintraining ist hart, weil so viel Muskelmasse gleichzeitig arbeitet – Puls und Atmung gehen hoch. Plane ruhig längere Pausen ein.`,
      `Muskelkater erreicht oft erst nach 24–72 Stunden seinen Höhepunkt – bei den Beinen besonders gemein.`
    ],
    fehler: [
      `Knie fallen bei Kniebeugen nach innen – Knie aktiv in Richtung der Zehen schieben.`,
      `Zu flach beugen – wenn deine Mobilität es erlaubt, mindestens bis die Oberschenkel parallel zum Boden sind.`,
      `Beinbeuger und Waden vergessen – beide gehören zum festen Programm.`
    ],
    tipp: `Beginne mit der schwersten Übung (Kniebeuge oder Beinpresse), dann Beinbeuger, zum Schluss Waden – unten mit voller Dehnung.`
  },
  {
    id: 'Unterarme', nick: 'Die Greifer', tag: 'Griffkraft entscheidet, was du halten kannst.',
    kurz: `Am Unterarm sitzen viele kleine Muskeln für Handgelenk und Finger. Sie halten die Stange fest, wenn die großen Muskeln eigentlich noch könnten.`,
    muskeln: [
      ['Handgelenk- und Fingerbeuger', 'Flexoren', `Auf der Innenseite. Schließen die Hand und beugen das Handgelenk – das ist deine Griffkraft. Wrist Curls, Farmer's Walk, Dead Hang.`],
      ['Handgelenk- und Fingerstrecker', 'Extensoren', `Auf der Außenseite. Strecken das Handgelenk und halten die Beuger im Gleichgewicht. Sind sie zu schwach, kann es am Ellbogen ziehen („Tennisarm“). Wrist Extensions.`],
      ['Oberarmspeichenmuskel', 'Brachioradialis', `Der dicke Muskel am oberen Unterarm Richtung Ellbogen. Hammer Curls und Reverse Curls treffen ihn.`],
      ['Dreher des Unterarms', 'Pronatoren und Supinatoren', `Drehen die Handfläche nach unten bzw. oben – wichtig bei Curls und Klimmzügen.`]
    ],
    gegen: `Beuger ↔ Strecker. Wer viel greift und zieht, sollte ab und zu die Strecker mittrainieren.`,
    alltag: `Einkaufstüten tragen, Gläser aufdrehen, Werkzeug halten, Händeschütteln, Klettern.`,
    fun: [
      `Beim Kreuzheben und beim Klimmzug gibt oft zuerst der Griff auf, nicht der Rücken. Dead Hang trainiert genau das.`,
      `Unterarme arbeiten schon im Alltag den ganzen Tag. Viele trainieren sie deshalb mit höheren Wiederholungen (12–20 oder mehr).`,
      `Beim Farmer's Walk nimmst du einfach schwere Hanteln und gehst – das trainiert Griff, Trapez und Rumpf gleichzeitig.`
    ],
    fehler: [
      `Beim Wrist Curl aus dem Ellbogen schwingen – Unterarm auflegen, nur das Handgelenk bewegen.`,
      `Immer mit Zughilfen (Straps) trainieren – dann bleibt der Griff schwach. Straps nur für die schwersten Sätze.`,
      `Die Streckerseite vergessen.`
    ],
    tipp: `Dead Hang am Ende des Trainings: Zeit stoppen und von Woche zu Woche ein paar Sekunden länger hängen. GymLog speichert deine Zeiten.`
  },
  {
    id: 'Abs', nick: 'Der Rumpf', tag: 'Sixpack ist nur die Spitze.',
    kurz: `Dein Bauch ist ein Korsett aus mehreren Schichten. Er beugt und dreht den Oberkörper und hält ihn – noch wichtiger – stabil, damit Kraft sauber übertragen wird.`,
    muskeln: [
      ['Gerader Bauchmuskel', 'Rectus abdominis', `Der „Sixpack“-Muskel. Beugt den Rumpf (Crunch, Sit-up) und zieht Brustkorb und Becken zusammen. Die Blöcke entstehen durch Sehnenstreifen – wie viele du sichtbar hast, ist Veranlagung.`],
      ['Schräge Bauchmuskeln', 'Obliquus externus / internus', `An den Seiten: drehen und neigen den Oberkörper und stabilisieren gegen Verdrehen (Russian Twists, Seitliche Planks).`],
      ['Querer Bauchmuskel', 'Transversus abdominis', `Die tiefste Schicht, wie ein Gürtel um den Bauch. Er erhöht den Druck im Bauchraum und stabilisiert die Wirbelsäule – bei schweren Kniebeugen und Kreuzheben „Bauch fest“.`],
      ['Hüftbeuger', 'Iliopsoas', `Gehört streng genommen nicht zum Bauch, hilft aber bei Beinheben und Sit-ups. Wer beim Leg Raise ins Hohlkreuz kippt, zieht zu stark an den Hüftbeugern.`]
    ],
    gegen: `Rückenstrecker. Bauch und unterer Rücken stabilisieren gemeinsam die Wirbelsäule.`,
    alltag: `Aufstehen aus dem Bett, Husten, Lachen, Gleichgewicht halten, schwere Dinge tragen – überall, wo dein Rumpf stabil bleiben muss.`,
    fun: [
      `Ob du den Sixpack siehst, hängt vor allem vom Körperfettanteil ab. Trainiert sind die Bauchmuskeln oft längst, nur noch versteckt.`,
      `Gezielt am Bauch Fett verbrennen (Spot Reduction) funktioniert nicht. Crunches bauen den Muskel auf, nehmen aber kein Bauchfett weg.`,
      `Planks sind isometrisch: Der Muskel arbeitet, ohne sich zu bewegen. GymLog misst deine Plank-Zeit.`
    ],
    fehler: [
      `Beim Crunch mit dem Nacken ziehen – Hände locker, Blick zur Decke, Rippen zum Becken bringen.`,
      `Beim Plank ins Hohlkreuz fallen – Po leicht anspannen, Bauch fest.`,
      `Jeden Tag Bauch trainieren – Bauchmuskeln brauchen auch Pausen, 2–4× pro Woche reicht.`
    ],
    tipp: `Kombiniere eine Beugeübung (Cable Crunches), eine Stabi-Übung (Planks oder Ab Wheel) und eine Seiten-/Dreh-Übung (Seitliche Planks).`
  }
];

const LEX_INFO = {
  grow: {
    title: 'So wächst ein Muskel',
    intro: `Kein Zauber: Ein Muskel wächst, weil du ihm einen Grund dafür gibst – und danach Zeit und Material zum Bauen.`,
    steps: [
      ['1  Reiz', `Du trainierst hart genug (nah an das Muskelversagen). Der Muskel merkt: Das war mehr, als ich gewohnt bin.`],
      ['2  Erholung', `Aufgebaut wird erst danach: im Schlaf, mit genug Essen und Eiweiß. Erholung ist kein Bonus, sondern der halbe Plan.`],
      ['3  Anpassung', `Der Muskel wird etwas dicker und stärker, damit ihn das nächste Mal dieselbe Last weniger fordert.`],
      ['4  Etwas mehr', `Damit es weitergeht, musst du den Reiz langsam steigern: mehr Gewicht, mehr Wiederholungen oder mehr Sätze. Das heißt progressive Überlastung. Genau dafür ist dein Progress-Tab da.`]
    ],
    numbers: [
      ['6–12', 'Wiederholungen pro Satz sind ein praktischer Standard. Auch 5–30 wirken, wenn der Satz hart genug ist.'],
      ['10–20', 'harte Sätze pro Muskelgruppe und Woche sind für viele ein guter Bereich. Anfänger wachsen auch mit weniger.'],
      ['2×', 'pro Woche jede Muskelgruppe trainieren funktioniert für die meisten sehr gut.'],
      ['1–3 min', 'Pause zwischen den Sätzen. Bei schweren Grundübungen eher länger.'],
      ['1,6–2,2 g', 'Eiweiß pro kg Körpergewicht und Tag ist ein häufig empfohlener Bereich für Muskelaufbau.'],
      ['7–9 h', 'Schlaf pro Nacht. Hier passiert ein großer Teil der Erholung.']
    ],
    note: `Das sind Richtwerte, keine Gesetze – jeder Körper ist anders. Bei Schmerzen, Verletzungen oder Vorerkrankungen sprich mit einer Ärztin, einem Arzt oder einem Trainer.`
  },
  terms: {
    title: 'Begriffe von A bis Z',
    intro: `Die wichtigsten Gym-Wörter, kurz und ohne Fachchinesisch.`,
    list: [
      ['1RM', `Dein „One-Rep-Max“: das schwerste Gewicht, das du genau einmal sauber bewegen kannst.`],
      ['Compound-Übung', `Grundübung, bei der mehrere Gelenke und Muskeln arbeiten, z. B. Kniebeugen, Kreuzheben, Bankdrücken, Rudern.`],
      ['Deload', `Eine leichtere Woche, in der du Gewicht oder Umfang senkst, damit sich der Körper erholt. Oft alle paar Wochen sinnvoll.`],
      ['DOMS (Muskelkater)', `Verzögerter Muskelschmerz 1–3 Tage nach ungewohnter Belastung. Er sagt nichts darüber, wie gut das Training war.`],
      ['Exzentrisch', `Die Phase, in der der Muskel sich unter Last verlängert, z. B. beim Absenken der Hantel. Konzentrisch ist das Gegenteil: Der Muskel verkürzt sich beim Heben.`],
      ['Hypertrophie', `Das Dickenwachstum des Muskels – das, was man meint, wenn man „Muskelaufbau“ sagt.`],
      ['Isolationsübung', `Eine Übung, die vor allem einen Muskel anspricht, z. B. Bizeps-Curl, Beinstrecker, Seitheben.`],
      ['Isometrisch', `Der Muskel hält Spannung, ohne sich zu bewegen, z. B. Plank oder Dead Hang.`],
      ['Mind-Muscle-Connection', `Dich bewusst auf den Muskel konzentrieren, den du trainierst. Hilft besonders bei Isolationsübungen.`],
      ['Progressive Überlastung', `Den Trainingsreiz langsam steigern (Gewicht, Wiederholungen, Sätze), damit der Muskel weiter wachsen muss.`],
      ['Pump', `Das Spannungsgefühl, wenn der Muskel nach dem Satz durchblutet ist. Fühlt sich gut an, ist aber kein Maß für Wachstum.`],
      ['RIR / RPE', `RIR = „Reps in Reserve“: wie viele Wiederholungen du noch geschafft hättest. RIR 2 heißt: noch zwei wären gegangen. RPE ist dieselbe Idee als Anstrengungsskala von 1 bis 10.`],
      ['ROM (Range of Motion)', `Wie weit du eine Übung bewegst. Eine große, saubere Bewegung ist meist besser als halbe Wiederholungen mit mehr Gewicht.`],
      ['Superset', `Zwei Übungen direkt nacheinander ohne Pause, z. B. Bizeps und Trizeps. Spart Zeit.`],
      ['Agonist / Antagonist', `Agonist = der Muskel, der die Bewegung macht. Antagonist = sein Gegenspieler, z. B. Bizeps und Trizeps oder Brust und Rücken.`]
    ]
  },
  myths: {
    title: 'Mythen-Check',
    intro: `Was man im Gym oft hört – und was davon stimmt.`,
    list: [
      ['„Muskeln werden zu Fett, wenn man aufhört.“', `Nein. Muskel und Fett sind zwei verschiedene Gewebe. Ohne Training schrumpft der Muskel, und wer weiter viel isst, kann Fett zulegen – aber das eine wird nicht zum anderen.`],
      ['„Ohne Muskelkater war das Training umsonst.“', `Nein. Muskelkater zeigt eher, dass der Reiz ungewohnt war. Du kannst gut wachsen, ohne dass es am nächsten Tag wehtut.`],
      ['„Crunches machen den Bauch flach.“', `Nein. Man kann nicht gezielt am Bauch abnehmen. Crunches bauen Bauchmuskeln auf – wie sichtbar sie sind, hängt vom Körperfett ab.`],
      ['„Frauen werden schnell zu bullig.“', `Nein. Für große, schwere Muskeln braucht es jahrelanges, hartes Training und viel Essen. Krafttraining macht meistens straffer und stärker.`],
      ['„Mehr Eiweiß ist immer besser.“', `Nein. Ab einer gewissen Menge bringt zusätzliches Eiweiß kaum noch etwas. Der empfohlene Bereich reicht meistens.`],
      ['„Leichte Gewichte tonen, schwere machen dick.“', `Nein. Ein Muskel wächst bei leichten wie bei schweren Gewichten, wenn der Satz anstrengend genug ist. Schwerer macht nicht automatisch dicker.`]
    ]
  }
};

const lexKey = g => [g.id, g.nick, ...g.muskeln.flatMap(m => [m[0], m[1]])].join(' ').toLowerCase();

SCREENS.lexicon = (entry, host) => {
  const st = entry.state;
  if (st.q == null) st.q = '';
  const q = st.q.trim().toLowerCase();
  const card = g => `<div class="card row tap" data-lex-key="${esc(lexKey(g))}" style="${!q || lexKey(g).includes(q) ? '' : 'display:none'}" data-on="${host.on(() => push('muscle', { id: g.id }))}">
      <div class="lx-badge">${ic('dumbbell')}</div>
      <div class="col g4" style="flex:1">
        <div class="row" style="gap:8px"><span class="headline">${esc(g.id)}</span><span class="tag">${esc(g.nick)}</span></div>
        <div class="sub muted">${esc(g.tag)}</div>
        <div class="caption muted">${g.muskeln.length} Muskeln erklärt</div>
      </div>
      <span class="muted">${ic('chevR')}</span></div>`;
  const li = (icon, title, fn) => `<button class="li ind" data-on="${host.on(fn)}"><span class="ic">${ic(icon)}</span><span style="flex:1">${title}</span><span class="chev">${ic('chevR')}</span></button>`;
  return {
    title: 'Muskel-Lexikon', large: true,
    body: `<div class="list-wrap" style="gap:22px">
      <div class="muted">Was sitzt wo, was macht der Muskel – und wie trainierst du ihn richtig? Verständlich erklärt, passend zu den Muskelgruppen in deinem Training.</div>
      <label class="search">${ic('search')}<input placeholder="Muskel suchen, z. B. Latissimus" value="${esc(st.q)}" autocomplete="off" data-in="${host.on(el => {
        st.q = el.value; const term = st.q.trim().toLowerCase();
        let any = false;
        screenEl().querySelectorAll('[data-lex-key]').forEach(c => { const hit = !term || c.dataset.lexKey.includes(term); c.style.display = hit ? '' : 'none'; any = any || hit; });
        const none = screenEl().querySelector('#lx-none'); if (none) none.style.display = any ? 'none' : '';
      })}"></label>
      <div class="col g12">${MUSKEL_LEX.map(card).join('')}<div id="lx-none" class="muted center" style="display:none">Kein Muskel gefunden.</div></div>
      <div><div class="group-title">Grundlagen</div><div class="group">
        ${li('chartUp', 'So wächst ein Muskel', () => push('lexInfo', { kind: 'grow' }))}
        ${li('hash', 'Begriffe von A bis Z', () => push('lexInfo', { kind: 'terms' }))}
        ${li('info', 'Mythen-Check', () => push('lexInfo', { kind: 'myths' }))}
      </div></div>
    </div>`
  };
};

SCREENS.muscle = (entry, host) => {
  const g = MUSKEL_LEX.find(x => x.id === entry.params.id) || MUSKEL_LEX[0];
  const active = Active.names();
  const exs = Pool.all().filter(e => e.muscle === g.id).sort((a, b) => (a.name < b.name ? -1 : 1));
  const title = t => `<div class="group-title"><span>${t}</span></div>`;
  return {
    title: g.id,
    body: `<div class="list-wrap" style="gap:22px">
      <div class="lx-hero"><div class="lx-nick">${esc(g.nick)}</div><div class="h1" style="font-size:30px">${esc(g.id)}</div><div class="headline">${esc(g.tag)}</div><div class="muted" style="line-height:1.45">${esc(g.kurz)}</div></div>
      <div>${title('Die Muskeln')}<div class="col g8">${g.muskeln.map(m => `<details class="lx-m"><summary><span class="col g4" style="flex:1"><span class="headline">${esc(m[0])}</span><span class="lx-latin">${esc(m[1])}</span></span><span class="chev">${ic('chevR')}</span></summary><div class="lx-body">${esc(m[2])}</div></details>`).join('')}</div></div>
      <div>${title('Gegenspieler')}<div class="card r16 sub" style="line-height:1.45">${esc(g.gegen)}</div></div>
      <div>${title('Wo du ihn im Alltag brauchst')}<div class="card r16 sub" style="line-height:1.45">${esc(g.alltag)}</div></div>
      <div>${title('Übungen in GymLog')}<div class="card r16 col g12"><div class="lx-chips">${exs.map(e => `<span class="lx-chip ${active.has(e.name) ? 'on' : ''}">${esc(e.name)}</span>`).join('')}</div><div class="caption muted">Farbig = in deinem Übungs-Pool aktiv.</div></div></div>
      <div>${title('Wusstest du?')}<div class="card r16"><ul class="lx-list">${g.fun.map(t => `<li><span>${esc(t)}</span></li>`).join('')}</ul></div></div>
      <div>${title('Typische Fehler')}<div class="card r16"><ul class="lx-list bad">${g.fehler.map(t => `<li><span>${esc(t)}</span></li>`).join('')}</ul></div></div>
      <div class="card tinted-12 r16 col g8"><div class="headline accent">Profi-Tipp</div><div style="line-height:1.45">${esc(g.tipp)}</div></div>
    </div>`
  };
};

SCREENS.lexInfo = (entry, host) => {
  const d = LEX_INFO[entry.params.kind] || LEX_INFO.grow;
  let inner = '';
  if (d.steps) {
    inner += `<div class="col g12">${d.steps.map(s => `<div class="card r16 col g8"><div class="headline accent">${esc(s[0])}</div><div style="line-height:1.45">${esc(s[1])}</div></div>`).join('')}</div>`;
    inner += `<div><div class="group-title"><span>Richtwerte</span></div><div class="col g8">${d.numbers.map(n => `<div class="card r16 row top" style="gap:14px"><div class="headline accent" style="min-width:76px">${esc(n[0])}</div><div class="sub muted" style="line-height:1.4">${esc(n[1])}</div></div>`).join('')}</div></div>`;
    inner += `<div class="caption muted" style="line-height:1.4;padding:0 4px">${esc(d.note)}</div>`;
  } else {
    inner += `<div class="col g8">${d.list.map(([a, b]) => `<div class="card r16 col g4"><div class="headline">${esc(a)}</div><div class="sub muted" style="line-height:1.45">${esc(b)}</div></div>`).join('')}</div>`;
  }
  return {
    title: d.title,
    body: `<div class="list-wrap" style="gap:20px"><div class="col g8"><div class="h1" style="font-size:30px">${esc(d.title)}</div><div class="muted">${esc(d.intro)}</div></div>${inner}</div>`
  };
};
