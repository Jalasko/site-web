export interface Guide {
  slug: string;
  title: string;
  kicker: string;
  summary: string;
  readingTime: number;
  sections: { heading: string; body: string[]; tips?: string[] }[];
}

export const GUIDES: Guide[] = [
  {
    slug: "placement-du-reticule",
    title: "Placement du réticule",
    kicker: "Visée",
    summary: "La compétence n°1 pour gagner des duels sans avoir besoin de flicks spectaculaires.",
    readingTime: 5,
    sections: [
      {
        heading: "Le principe",
        body: [
          "Le placement du réticule (crosshair placement) consiste à garder en permanence votre viseur à hauteur de tête, là où un ennemi est susceptible d'apparaître.",
          "Plus votre réticule est bien placé, moins vous avez de distance à parcourir avec la souris : vous tirez plus vite et plus précisément.",
        ],
        tips: ["Visez toujours à hauteur de tête, jamais vers le sol.", "Collez votre réticule au bord des angles, pas au milieu des couloirs.", "Anticipez les positions courantes (boîtes, angles serrés, hauteurs)."],
      },
      {
        heading: "Pré-viser les angles",
        body: [
          "En approchant d'un angle, décalez-vous progressivement (« slicing the pie ») en gardant le réticule sur la ligne où un adversaire apparaîtra.",
          "Ainsi, vous ne découvrez qu'un ennemi à la fois et vous n'avez qu'à cliquer au bon moment.",
        ],
      },
      {
        heading: "S'entraîner",
        body: ["Dans le Range, marchez dans les couloirs en surveillant votre réticule. En partie, relancez vos replays et notez où se trouvait votre viseur à chaque mort."],
        tips: ["10 minutes de Deathmatch en se concentrant uniquement sur la hauteur du réticule.", "Utilisez un réticule fin et sans erreur de tir pour visualiser précisément la tête."],
      },
    ],
  },
  {
    slug: "economie",
    title: "Gérer l'économie",
    kicker: "Stratégie",
    summary: "Full-buy, force-buy, eco : quand acheter et quand économiser pour maximiser vos rounds gagnants.",
    readingTime: 6,
    sections: [
      {
        heading: "Les bases",
        body: [
          "Chaque round rapporte des crédits : 3 000 pour une victoire, 1 900 pour une défaite (puis 2 400 et 2 900 en cas de défaites consécutives), 200 par kill et 300 pour la pose du spike.",
          "Le plafond est de 9 000 crédits. Un full-buy typique (fusil + bouclier lourd + utilitaires) coûte environ 3 900 à 4 500 crédits.",
        ],
      },
      {
        heading: "Les types d'achat",
        body: [
          "Full-buy : fusil d'assaut, bouclier lourd et toutes les compétences.",
          "Eco (save) : on dépense très peu pour garantir un full-buy au round suivant.",
          "Force-buy : on achète tout ce qu'on peut (Spectre, Sheriff, bouclier léger) pour casser l'élan adverse.",
        ],
        tips: ["Achetez en équipe : un joueur en full-buy seul gaspille ses crédits.", "Après un pistol round perdu, faites souvent une eco au round 2.", "Récupérez les armes adverses après une eco gagnée."],
      },
      {
        heading: "Lire l'économie adverse",
        body: ["Regardez le tableau des scores (Tab) : le nombre de crédits perdus par l'adversaire et ses achats précédents indiquent s'il sera en eco. Adaptez vos positions : jouez plus serré contre un force-buy à base de mitraillettes."],
      },
    ],
  },
  {
    slug: "deplacements",
    title: "Déplacements et counter-strafe",
    kicker: "Mécaniques",
    summary: "Pourquoi s'arrêter avant de tirer, comment strafer et utiliser le son à votre avantage.",
    readingTime: 5,
    sections: [
      {
        heading: "La précision en mouvement",
        body: ["Dans VALORANT, tirer en courant rend vos balles très imprécises. Il faut être immobile (ou presque) au moment du tir pour profiter de la précision de la première balle."],
      },
      {
        heading: "Le counter-strafe",
        body: [
          "Pour s'arrêter instantanément, appuyez brièvement sur la direction opposée à votre mouvement (A puis D, ou l'inverse). Tirez juste après l'arrêt, puis repartez.",
          "Ce rythme « strafe – stop – tir – strafe » vous rend difficile à toucher tout en restant précis.",
        ],
        tips: ["Entraînez-vous dans le Range avec les cibles mobiles.", "Ne tirez pas de longues rafales en bougeant : 2 à 4 balles puis repositionnement."],
      },
      {
        heading: "Le son",
        body: ["Marcher (Shift) rend vos pas silencieux. Utilisez-le pour approcher un site, mais courez lors des rotations rapides : la vitesse vaut souvent mieux que la discrétion."],
      },
    ],
  },
  {
    slug: "meilleurs-parametres",
    title: "Les meilleurs paramètres",
    kicker: "Configuration",
    summary: "Sensibilité, réticule, graphismes et minicarte : la configuration recommandée pour bien démarrer.",
    readingTime: 7,
    sections: [
      {
        heading: "Sensibilité",
        body: [
          "L'eDPI (DPI × sensibilité en jeu) permet de comparer les sensibilités. La plupart des pros jouent entre 200 et 400 eDPI.",
          "Une sensibilité basse favorise la précision ; choisissez-en une qui vous permet de faire un 180° en un mouvement ample du bras.",
        ],
        tips: ["Point de départ : 800 DPI et 0,3 à 0,4 de sensibilité.", "Gardez la même sensibilité au moins plusieurs semaines."],
      },
      {
        heading: "Graphismes",
        body: ["Privilégiez les FPS : qualité des matériaux, textures et détails en bas, anti-aliasing MSAA 2x ou 4x, V-Sync désactivé, et limitez les FPS légèrement au-dessus de la fréquence de votre écran.", "Activez « Améliorer la clarté » pour mieux distinguer les silhouettes."],
      },
      {
        heading: "Minicarte",
        body: ["Réglez la minicarte en mode fixe et non rotative, zoom autour de 0,9, et activez l'affichage de la zone de vision : vous lirez plus vite les informations de vos coéquipiers."],
      },
      {
        heading: "Réticule",
        body: ["Un réticule simple, d'une couleur contrastée (cyan, vert ou jaune), sans erreur de tir ni de mouvement, est idéal. Inspirez-vous des réglages des pros et importez leur code en un clic."],
      },
    ],
  },
];
