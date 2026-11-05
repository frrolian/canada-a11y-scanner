// Plain-language guidance: a simple title, why it matters, and step-by-step fixes
// for each website platform (Squarespace, Wix, WordPress, everything else), in English and French.
// Menu names were checked against each platform's help centre (Nov 2026). Platforms change their
// menus often, so steps say what to look for, not only where to click.

// Where the fix happens. Used for the to-do list at the top of the report.
export const WHERE = {
  editor: { en: 'In the page editor', fr: "Dans l'éditeur de page", order: 1 },
  content: { en: 'Your words and pages', fr: 'Vos textes et pages', order: 2 },
  styles: { en: 'Site styles (colours and fonts)', fr: 'Styles du site (couleurs et polices)', order: 3 },
  settings: { en: 'Site settings', fr: 'Paramètres du site', order: 4 },
  css: { en: 'Paste a CSS snippet once', fr: 'Coller un extrait CSS une fois', order: 5 },
  codeinjection: { en: 'Paste a code snippet once', fr: 'Coller un extrait de code une fois', order: 6 },
  external: { en: 'Outside your site (YouTube, Vimeo, PDF files)', fr: 'Hors de votre site (YouTube, Vimeo, fichiers PDF)', order: 7 },
  yourcode: { en: 'In code you added (Code or Embed blocks)', fr: 'Dans du code que vous avez ajouté (blocs Code ou Intégration)', order: 8 },
  developer: { en: 'Ask a developer or your AI builder', fr: 'Demander à un développeur ou à votre outil IA', order: 9 },
  platform: { en: 'Built into the platform (not fixable by you)', fr: 'Intégré à la plateforme (vous ne pouvez pas le corriger)', order: 10 },
};

export const IMPACT_PLAIN = {
  critical: { en: 'Blocks some people completely', fr: 'Bloque complètement certaines personnes' },
  serious: { en: 'Makes it very hard for some people', fr: 'Rend la tâche très difficile pour certaines personnes' },
  moderate: { en: 'Makes it harder for some people', fr: 'Complique la tâche pour certaines personnes' },
  minor: { en: 'Small annoyance', fr: 'Petit irritant' },
};

const SQ_CSS_PATH = {
  en: 'Open the Pages panel, click “Custom Code” at the bottom, then “Custom CSS” (version 7.0: Design → Custom CSS). Paste the snippet and click Save. Custom CSS works on every Squarespace plan.',
  fr: 'Ouvrez le panneau « Pages », cliquez sur « Custom Code » en bas, puis « Custom CSS » (version 7.0 : Design → Custom CSS). Collez l\'extrait et cliquez sur Save. Le CSS personnalisé fonctionne avec tous les forfaits Squarespace.',
};
const SQ_INJECT_PATH = {
  en: 'Open the Pages panel, click “Custom Code”, then “Code Injection”, and paste the snippet into the Footer box. Click Save. Code Injection needs a Core, Plus or Advanced plan.',
  fr: 'Ouvrez le panneau « Pages », cliquez sur « Custom Code », puis « Code Injection », et collez l\'extrait dans la case Footer. Cliquez sur Save. L\'injection de code exige un forfait Core, Plus ou Advanced.',
};
const WIX_CODE_PATH = {
  en: 'In your Wix dashboard, go to Settings → Custom Code → “+ Add Custom Code”, paste the snippet, choose “All pages” and “Body – end”. Custom code needs a paid plan with a connected domain.',
  fr: 'Dans le tableau de bord Wix, allez à Settings → Custom Code → « + Add Custom Code », collez l\'extrait, choisissez « All pages » et « Body – end ». Le code personnalisé exige un forfait payant avec un domaine connecté.',
};
const WP_CSS_PATH = {
  en: 'Block themes: Appearance → Editor → Styles → (⋮ menu) → Additional CSS. Classic themes: Appearance → Customize → Additional CSS. Paste and save.',
  fr: 'Thèmes à blocs : Apparence → Éditeur → Styles → (menu ⋮) → CSS additionnel. Thèmes classiques : Apparence → Personnaliser → CSS additionnel. Collez et enregistrez.',
};

const LANG_SCRIPT = `<script>
  // Mark "Français" / "English" links with their language
  document.querySelectorAll('a').forEach(function (a) {
    var t = a.textContent.trim().toLowerCase();
    if (t === 'français' || t === 'francais' || t === 'fr') a.setAttribute('lang', 'fr');
    if (t === 'english' || t === 'en') a.setAttribute('lang', 'en');
  });
</script>`;

const UNDERLINE_CSS = `/* Underline links inside paragraphs so they don't rely on colour alone */
main p a, main li a { text-decoration: underline; }`;

const TARGET_CSS = `/* Make small links and buttons easier to tap */
main a, main button { min-height: 24px; min-width: 24px; display: inline-block; }`;

const R = {
  'image-alt': {
    title: { en: 'Some images have no description', fr: "Certaines images n'ont pas de description" },
    why: { en: 'People who are blind use screen readers that read images aloud. Without a description (called “alt text”) they hear nothing, or a file name.', fr: "Les personnes aveugles utilisent des lecteurs d'écran qui lisent les images à voix haute. Sans description (« texte alternatif »), elles n'entendent rien, ou un nom de fichier." },
    squarespace: { where: 'editor',
      en: ['Open the page and click Edit.', 'Click the image, then the pencil icon.', 'In the Content tab, type a short description in “Image alt text”. Say what the image shows or does, e.g. “Our team at the Toronto office”.', 'Images inside a gallery or an auto layout section: open “Edit Content”, select the image, and fill in “Image alt text”.', 'Product images: hover the image, choose “Edit metadata”, and fill in “Alt text”.', 'Tip: don\'t start with “image of”.'],
      fr: ['Ouvrez la page et cliquez sur Edit.', "Cliquez sur l'image, puis sur l'icône crayon.", "Dans l'onglet Content, écrivez une courte description dans « Image alt text ». Dites ce que l'image montre ou fait, p. ex. « Notre équipe au bureau de Montréal ».", "Images dans une galerie ou une section à mise en page automatique : ouvrez « Edit Content », choisissez l'image et remplissez « Image alt text ».", "Images de produits : survolez l'image, choisissez « Edit metadata » et remplissez « Alt text ».", 'Conseil : ne commencez pas par « image de ».'] },
    wix: { where: 'editor',
      en: ['Click the image in the Editor.', 'Click Settings.', 'Under “What\'s in the image?”, write a short description, then press Enter.', 'Galleries: click “Manage Media”, select each image, and add its alt text.', 'Tip: Settings → Accessibility Wizard can suggest alt text for many images at once. Always read and correct it.', 'Publish your site.'],
      fr: ["Cliquez sur l'image dans l'éditeur.", 'Cliquez sur Settings.', 'Sous « What\'s in the image? », écrivez une courte description, puis appuyez sur Entrée.', 'Galeries : cliquez sur « Manage Media », choisissez chaque image et ajoutez son texte alternatif.', "Conseil : Settings → Accessibility Wizard peut suggérer du texte alternatif pour plusieurs images. Relisez-le et corrigez-le toujours.", 'Publiez votre site.'] },
    wordpress: { where: 'editor',
      en: ['Open the page in the editor and click the image.', 'In the right-hand sidebar, find “Alternative text” and describe the image.', 'If the image is only decoration, leave the alternative text empty.', 'Click Update.', 'Tip: also add alt text in Media → Library, so the image has it everywhere you use it.'],
      fr: ["Ouvrez la page dans l'éditeur et cliquez sur l'image.", 'Dans la barre latérale de droite, trouvez « Texte alternatif » et décrivez l\'image.', "Si l'image est purement décorative, laissez le texte alternatif vide.", 'Cliquez sur Mettre à jour.', "Conseil : ajoutez aussi le texte alternatif dans Médias → Bibliothèque, pour qu'il suive l'image partout."] },
    generic: { where: 'editor',
      en: ['Add an alt attribute that says what the image shows or does, e.g. alt="Company logo".', 'If the image is only decoration, use an empty alt: alt="".'],
      fr: ["Ajoutez un attribut alt qui décrit ce que l'image montre ou fait, p. ex. alt=\"Logo de l'entreprise\".", 'Si l\'image est décorative, utilisez un alt vide : alt="".'] },
    code: '<img src="team.jpg" alt="Our team at the Toronto office">',
  },

  'color-contrast': {
    title: { en: 'Some text is hard to read (not enough colour contrast)', fr: 'Certains textes sont difficiles à lire (contraste insuffisant)' },
    why: { en: 'Light grey on white, or white on a pale photo, is hard to read for people with low vision, older visitors, and anyone on a phone in the sun.', fr: "Du gris pâle sur du blanc, ou du blanc sur une photo claire, est difficile à lire pour les personnes ayant une basse vision, les personnes âgées et toute personne sur un téléphone au soleil." },
    squarespace: { where: 'styles',
      en: ['In the editor, open Site styles (the paintbrush icon), then Colors.', 'Click the section\'s colour theme and make the text darker on light backgrounds, or lighter on dark backgrounds. Changing a theme fixes every section that uses it.', 'Text on top of a photo: add an image overlay to the section, or move the text off the image.', 'Squarespace adjusts some text colours for you, but always re-check: run this scan again.'],
      fr: ["Dans l'éditeur, ouvrez Site styles (icône pinceau), puis Colors.", "Cliquez sur le thème de couleur de la section et rendez le texte plus foncé sur fond pâle, ou plus pâle sur fond foncé. Modifier un thème corrige toutes les sections qui l'utilisent.", "Texte sur une photo : ajoutez une superposition (overlay) à l'image de la section, ou déplacez le texte hors de l'image.", "Squarespace ajuste certaines couleurs pour vous, mais vérifiez toujours : relancez cette analyse."] },
    wix: { where: 'styles',
      en: ['Select the text or button and open its Design or text settings.', 'Choose a colour that stands out clearly against the background (darker on light, lighter on dark).', 'To fix it everywhere, change your site\'s theme colours (Site Design → Colors).', 'Settings → Accessibility Wizard has a contrast checker you can use to confirm.'],
      fr: ['Sélectionnez le texte ou le bouton et ouvrez ses réglages Design ou de texte.', "Choisissez une couleur qui ressort nettement sur l'arrière-plan (plus foncée sur fond pâle, plus pâle sur fond foncé).", 'Pour corriger partout, modifiez les couleurs du thème de votre site (Site Design → Colors).', "Settings → Accessibility Wizard offre un vérificateur de contraste pour confirmer."] },
    wordpress: { where: 'styles',
      en: ['Block themes: Appearance → Editor → Styles → Colors. Classic themes: Appearance → Customize → Colors.', 'Or select the block and change its Text or Background colour in the sidebar. WordPress warns you when contrast is too low.'],
      fr: ['Thèmes à blocs : Apparence → Éditeur → Styles → Couleurs. Thèmes classiques : Apparence → Personnaliser → Couleurs.', "Ou sélectionnez le bloc et changez sa couleur de texte ou d'arrière-plan dans la barre latérale. WordPress vous avertit si le contraste est trop faible."] },
    generic: { where: 'styles',
      en: ['Make the text darker or the background lighter (or the reverse).', 'Normal text needs a contrast ratio of at least 4.5 to 1. Large text needs 3 to 1.'],
      fr: ["Rendez le texte plus foncé ou l'arrière-plan plus pâle (ou l'inverse).", "Le texte normal exige un contraste d'au moins 4,5 pour 1. Le grand texte exige 3 pour 1."] },
  },

  'link-name': {
    title: { en: 'Some links have no words (screen readers can\'t say where they go)', fr: 'Certains liens n\'ont pas de texte (les lecteurs d\'écran ne peuvent pas dire où ils mènent)' },
    why: { en: 'A link that is only an image or icon, with no description, is announced as just “link”. People can\'t tell where it goes.', fr: "Un lien composé seulement d'une image ou d'une icône, sans description, est annoncé comme « lien ». On ne sait pas où il mène." },
    squarespace: { where: 'editor',
      en: ['If the link is an image with a click-through link: add “Image alt text” that says where it goes, e.g. “Book a free consultation” (click the image → pencil → Content).', 'If it is a button or a text link, make sure it has visible words.', 'Icons in the header or social icons are made by Squarespace. If one is flagged, report it to Squarespace support.'],
      fr: ["Si le lien est une image cliquable : ajoutez un « Image alt text » qui dit où il mène, p. ex. « Réserver une consultation gratuite » (cliquez sur l'image → crayon → Content).", "S'il s'agit d'un bouton ou d'un lien texte, assurez-vous qu'il contient des mots visibles.", "Les icônes de l'en-tête et les icônes de réseaux sociaux sont créées par Squarespace. Si l'une d'elles est signalée, avisez le soutien de Squarespace."] },
    wix: { where: 'editor',
      en: ['Icon buttons: select the button → Settings → fill in the “Accessible name” (e.g. “Instagram”).', 'Linked images: add alt text that says where the link goes.'],
      fr: ['Boutons-icônes : sélectionnez le bouton → Settings → remplissez « Accessible name » (p. ex. « Instagram »).', "Images avec lien : ajoutez un texte alternatif qui dit où mène le lien."] },
    wordpress: { where: 'editor',
      en: ['Linked image: click it and add “Alternative text” that says where it goes.', 'Social Icons block: click each icon and fill in its label.', 'If it comes from your theme\'s header or footer, check the theme\'s settings or ask the theme author.'],
      fr: ["Image avec lien : cliquez dessus et ajoutez un « Texte alternatif » qui dit où elle mène.", 'Bloc Icônes de réseaux sociaux : cliquez sur chaque icône et remplissez son libellé.', "Si cela vient de l'en-tête ou du pied de page du thème, vérifiez les réglages du thème ou demandez à son auteur."] },
    generic: { where: 'editor',
      en: ['Give every link text that says where it goes.', 'For icon-only links, add aria-label, e.g. aria-label="Instagram".'],
      fr: ['Donnez à chaque lien un texte qui indique sa destination.', 'Pour les liens avec seulement une icône, ajoutez aria-label, p. ex. aria-label="Instagram".'] },
    code: '<a href="https://instagram.com/yourname" aria-label="Instagram">\n  <svg aria-hidden="true">…</svg>\n</a>',
  },

  'button-name': {
    title: { en: 'Some buttons have no name', fr: "Certains boutons n'ont pas de nom" },
    why: { en: 'Screen readers announce just “button”, so people don\'t know what it does.', fr: "Les lecteurs d'écran annoncent seulement « bouton » : on ne sait pas à quoi il sert." },
    squarespace: { where: 'editor',
      en: ['Click the Button block → pencil → type clear button text, e.g. “Book a call”.', 'Menu, cart and search icons in the header are made by Squarespace. If one is flagged, report it to Squarespace support.'],
      fr: ['Cliquez sur le bloc Button → crayon → écrivez un texte clair, p. ex. « Prendre rendez-vous ».', "Les icônes de menu, de panier et de recherche de l'en-tête sont créées par Squarespace. Si l'une d'elles est signalée, avisez le soutien de Squarespace."] },
    wix: { where: 'editor',
      en: ['Select the button → Settings → add button text, or fill in the “Accessible name” for icon-only buttons.'],
      fr: ['Sélectionnez le bouton → Settings → ajoutez un texte, ou remplissez « Accessible name » pour les boutons-icônes.'] },
    wordpress: { where: 'editor',
      en: ['Click the button and type clear text in it.', 'Icon buttons from a theme or plugin: check its settings for a label, or ask its author.'],
      fr: ['Cliquez sur le bouton et écrivez un texte clair.', "Boutons-icônes d'un thème ou d'une extension : cherchez un réglage de libellé, ou demandez à son auteur."] },
    generic: { where: 'editor',
      en: ['Put text inside the button, or add aria-label for icon-only buttons.'],
      fr: ['Mettez du texte dans le bouton, ou ajoutez aria-label pour les boutons-icônes.'] },
    code: '<button type="button" aria-label="Close menu">✕</button>',
  },

  label: {
    title: { en: 'Some form fields have no label', fr: "Certains champs de formulaire n'ont pas d'étiquette" },
    why: { en: 'Without a label, people using screen readers (and people with memory difficulties once they start typing) don\'t know what to enter.', fr: "Sans étiquette, les personnes utilisant un lecteur d'écran (et celles qui ont des troubles de mémoire une fois qu'elles tapent) ne savent pas quoi inscrire." },
    squarespace: { where: 'editor',
      en: ['Click the Form block → pencil → Content tab → “Edit Form Fields”.', 'Select each field and give it a clear Label, e.g. “Email address”. Don\'t rely on placeholder text alone.', 'Mark required fields as required, and click Save.', 'Newsletter blocks: open the block and check each field has a label.'],
      fr: ['Cliquez sur le bloc Form → crayon → onglet Content → « Edit Form Fields ».', "Choisissez chaque champ et donnez-lui une étiquette (Label) claire, p. ex. « Adresse courriel ». Ne comptez pas seulement sur le texte indicatif.", 'Indiquez les champs obligatoires, puis cliquez sur Save.', "Blocs Newsletter : ouvrez le bloc et vérifiez que chaque champ a une étiquette."] },
    wix: { where: 'editor',
      en: ['Click the form → edit the form → select the field and give it a clear field title (label).', 'Keep the title visible; don\'t rely on placeholder text alone.'],
      fr: ['Cliquez sur le formulaire → modifiez-le → choisissez le champ et donnez-lui un titre (étiquette) clair.', "Gardez le titre visible; ne comptez pas seulement sur le texte indicatif."] },
    wordpress: { where: 'editor',
      en: ['Open your form plugin (e.g. WPForms, Gravity Forms, Contact Form 7) and give every field a visible label.', 'Contact Form 7: wrap each field in a <label> in the form template.'],
      fr: ["Ouvrez votre extension de formulaire (p. ex. WPForms, Gravity Forms, Contact Form 7) et donnez à chaque champ une étiquette visible.", 'Contact Form 7 : placez chaque champ dans un <label> dans le modèle du formulaire.'] },
    generic: { where: 'editor',
      en: ['Connect a visible <label> to every field. A placeholder is not a label.'],
      fr: ['Associez une étiquette <label> visible à chaque champ. Un texte indicatif ne remplace pas une étiquette.'] },
    code: '<label for="email">Email address</label>\n<input id="email" type="email" autocomplete="email">',
  },

  'document-title': {
    title: { en: 'The page has no title', fr: "La page n'a pas de titre" },
    why: { en: 'The title is the first thing screen readers say, and it\'s what shows in browser tabs and Google.', fr: "Le titre est la première chose lue par les lecteurs d'écran, et c'est ce qui s'affiche dans les onglets et dans Google." },
    squarespace: { where: 'settings',
      en: ['Open the Pages panel, hover the page and click the gear icon.', 'In the SEO tab, write a title that says what the page is (up to 100 characters).', 'For the homepage, set the title in SEO / AI Visibility → SEO Settings.'],
      fr: ["Ouvrez le panneau Pages, survolez la page et cliquez sur l'icône d'engrenage.", "Dans l'onglet SEO, écrivez un titre qui dit de quoi parle la page (jusqu'à 100 caractères).", "Pour la page d'accueil, définissez le titre dans SEO / AI Visibility → SEO Settings."] },
    wix: { where: 'settings',
      en: ['Open the Pages menu, click ⋯ next to the page, choose SEO basics, and set the title tag.'],
      fr: ['Ouvrez le menu Pages, cliquez sur ⋯ à côté de la page, choisissez SEO basics et définissez la balise de titre.'] },
    wordpress: { where: 'settings',
      en: ['Give the page a clear title in the editor. If you use an SEO plugin (Yoast, Rank Math), set the SEO title there too.'],
      fr: ["Donnez un titre clair à la page dans l'éditeur. Si vous utilisez une extension SEO (Yoast, Rank Math), définissez aussi le titre SEO."] },
    generic: { where: 'settings',
      en: ['Add a unique <title> to every page, e.g. “Contact us | Company name”.'],
      fr: ['Ajoutez un <title> unique à chaque page, p. ex. « Nous joindre | Nom de l\'entreprise ».'] },
  },

  'html-has-lang': {
    title: { en: 'The site\'s language is not set', fr: "La langue du site n'est pas définie" },
    why: { en: 'Screen readers use it to pick the right voice. Without it, English or French text may be read with the wrong accent.', fr: "Les lecteurs d'écran s'en servent pour choisir la bonne voix. Sans elle, le texte peut être lu avec le mauvais accent." },
    squarespace: { where: 'settings',
      en: ['Version 7.1: Settings → Site Languages. Version 7.0: Settings → Language & region.', 'Set the site language to English or French.'],
      fr: ['Version 7.1 : Settings → Site Languages. Version 7.0 : Settings → Language & region.', 'Réglez la langue du site sur le français ou l\'anglais.'] },
    wix: { where: 'settings',
      en: ['Dashboard → Settings → Language & Region → Site language.', 'With Wix Multilingual, the main language is chosen during setup.'],
      fr: ['Tableau de bord → Settings → Language & Region → Site language.', "Avec Wix Multilingual, la langue principale est choisie à l'installation."] },
    wordpress: { where: 'settings',
      en: ['Settings → General → Site Language.'],
      fr: ['Réglages → Général → Langue du site.'] },
    generic: { where: 'settings',
      en: ['Add the language to the <html> tag: lang="en" or lang="fr".'],
      fr: ['Ajoutez la langue à la balise <html> : lang="fr" ou lang="en".'] },
    code: '<html lang="en">',
  },

  'video-caption': {
    title: { en: 'A video has no captions', fr: "Une vidéo n'a pas de sous-titres" },
    why: { en: 'People who are Deaf or hard of hearing, and anyone watching with the sound off, miss everything that is said.', fr: "Les personnes sourdes ou malentendantes, et toute personne qui regarde sans le son, manquent tout ce qui est dit." },
    squarespace: { where: 'external',
      en: ['Upload the video to YouTube or Vimeo and turn on captions there (check and correct automatic captions).', 'Add it to your page with a Video block. Visitors can then turn captions on.', 'Videos uploaded straight to Squarespace can\'t carry a caption file. Use YouTube or Vimeo, or add captions into the video itself before uploading.', 'Add a written transcript below the video in a Text block.'],
      fr: ['Téléversez la vidéo sur YouTube ou Vimeo et activez-y les sous-titres (vérifiez et corrigez les sous-titres automatiques).', "Ajoutez-la à la page avec un bloc Video. Les visiteurs pourront activer les sous-titres.", "Les vidéos téléversées directement dans Squarespace ne peuvent pas contenir de fichier de sous-titres. Utilisez YouTube ou Vimeo, ou intégrez les sous-titres à la vidéo avant de la téléverser.", 'Ajoutez une transcription écrite sous la vidéo dans un bloc Text.'] },
    wix: { where: 'external',
      en: ['Wix Video can\'t add caption files. Use a YouTube or Vimeo video with captions turned on, or add captions into the video itself before uploading.', 'Add a written transcript below the video.'],
      fr: ['Wix Video ne permet pas d\'ajouter de fichier de sous-titres. Utilisez une vidéo YouTube ou Vimeo avec sous-titres, ou intégrez les sous-titres à la vidéo avant de la téléverser.', 'Ajoutez une transcription écrite sous la vidéo.'] },
    wordpress: { where: 'editor',
      en: ['Click the Video block → “Text tracks” in the toolbar → upload a captions file (.vtt) and set its kind to Captions.', 'Or use a YouTube or Vimeo video with captions turned on.', 'Add a written transcript below the video.'],
      fr: ['Cliquez sur le bloc Vidéo → « Pistes de texte » dans la barre d\'outils → téléversez un fichier de sous-titres (.vtt) de type Captions.', 'Ou utilisez une vidéo YouTube ou Vimeo avec sous-titres.', 'Ajoutez une transcription écrite sous la vidéo.'] },
    generic: { where: 'external',
      en: ['Add a captions file with <track kind="captions">, or use a video player with captions turned on.'],
      fr: ['Ajoutez un fichier de sous-titres avec <track kind="captions">, ou utilisez un lecteur vidéo avec sous-titres.'] },
    code: '<video controls>\n  <source src="intro.mp4">\n  <track kind="captions" src="intro.en.vtt" srclang="en" label="English">\n</video>',
  },

  'frame-title': {
    title: { en: 'An embedded map, video or widget has no name', fr: "Une carte, vidéo ou application intégrée n'a pas de nom" },
    why: { en: 'Screen readers announce it as an unnamed “frame”, so people don\'t know what it is.', fr: "Les lecteurs d'écran l'annoncent comme un « cadre » sans nom : on ne sait pas ce que c'est." },
    squarespace: { where: 'yourcode',
      en: ['If you pasted embed code into an Embed or Code block: edit the block and add title="…" inside the <iframe> tag, e.g. title="Map of our office".', 'If Squarespace added it (e.g. a Map block), report it to Squarespace support.'],
      fr: ["Si vous avez collé du code dans un bloc Embed ou Code : modifiez le bloc et ajoutez title=\"…\" dans la balise <iframe>, p. ex. title=\"Carte de notre bureau\".", "Si Squarespace l'a ajouté (p. ex. un bloc Map), avisez le soutien de Squarespace."] },
    wix: { where: 'yourcode',
      en: ['Embedded HTML: edit the code and add title="…" to the <iframe>.', 'Wix apps: report it to Wix support.'],
      fr: ['HTML intégré : modifiez le code et ajoutez title="…" à l\'<iframe>.', "Applications Wix : avisez le soutien de Wix."] },
    wordpress: { where: 'yourcode',
      en: ['Edit the Custom HTML or embed block and add title="…" to the <iframe>.'],
      fr: ['Modifiez le bloc HTML personnalisé ou d\'intégration et ajoutez title="…" à l\'<iframe>.'] },
    generic: { where: 'yourcode', en: ['Add title="…" to every <iframe>.'], fr: ['Ajoutez title="…" à chaque <iframe>.'] },
    code: '<iframe src="https://maps.google.com/…" title="Map of our office"></iframe>',
  },

  'link-in-text-block': {
    title: { en: 'Links in paragraphs only stand out by colour', fr: 'Les liens dans les paragraphes ne se distinguent que par la couleur' },
    why: { en: 'People who are colour-blind can\'t tell the link apart from normal text.', fr: "Les personnes daltoniennes ne peuvent pas distinguer le lien du texte normal." },
    squarespace: { where: 'css', snippet: UNDERLINE_CSS, en: [SQ_CSS_PATH.en], fr: [SQ_CSS_PATH.fr] },
    wix: { where: 'editor', en: ['Select the linked words and click Underline in the text toolbar.'], fr: ['Sélectionnez les mots liés et cliquez sur Souligner dans la barre de texte.'] },
    wordpress: { where: 'css', snippet: UNDERLINE_CSS, en: [WP_CSS_PATH.en], fr: [WP_CSS_PATH.fr] },
    generic: { where: 'css', snippet: UNDERLINE_CSS, en: ['Underline links inside paragraphs.'], fr: ['Soulignez les liens dans les paragraphes.'] },
  },

  'target-size': {
    title: { en: 'Some buttons or links are too small to tap', fr: 'Certains boutons ou liens sont trop petits pour être touchés' },
    why: { en: 'People with tremors or limited hand movement, and everyone on a phone, can miss small targets.', fr: "Les personnes ayant des tremblements ou une mobilité réduite des mains, et tout le monde sur téléphone, peuvent rater les petites cibles." },
    squarespace: { where: 'css', snippet: TARGET_CSS, en: ['If it is in the header or footer, try a bigger icon or font size in Site styles first.', SQ_CSS_PATH.en], fr: ["Si c'est dans l'en-tête ou le pied de page, essayez d'abord une icône ou une police plus grande dans Site styles.", SQ_CSS_PATH.fr] },
    wix: { where: 'editor', en: ['Select the button or icon and make it bigger (at least 24 × 24 pixels), or add space around it.'], fr: ["Sélectionnez le bouton ou l'icône et agrandissez-le (au moins 24 × 24 pixels), ou ajoutez de l'espace autour."] },
    wordpress: { where: 'css', snippet: TARGET_CSS, en: [WP_CSS_PATH.en], fr: [WP_CSS_PATH.fr] },
    generic: { where: 'css', snippet: TARGET_CSS, en: ['Make buttons and links at least 24 × 24 pixels, or leave space around them.'], fr: ['Les boutons et liens doivent mesurer au moins 24 × 24 pixels, ou avoir de l\'espace autour.'] },
  },

  // ---------- Canada-specific ----------
  'ca-language-toggle': {
    title: { en: 'No link to a French (or English) version', fr: "Aucun lien vers une version anglaise (ou française)" },
    why: { en: 'Federal institutions must serve the public in both official languages, and many Canadians expect to switch language easily.', fr: 'Les institutions fédérales doivent servir le public dans les deux langues officielles, et beaucoup de gens s\'attendent à pouvoir changer de langue facilement.' },
    squarespace: { where: 'settings',
      en: ['Version 7.1: use Squarespace\'s built-in Weglot integration to add French. It adds a language switcher to your header.', 'Or build French pages yourself: in the navigation, add an “English” and a “Français” dropdown, each with matching pages (duplicate each page, then translate it).'],
      fr: ["Version 7.1 : utilisez l'intégration Weglot de Squarespace pour ajouter l'anglais. Elle ajoute un sélecteur de langue dans l'en-tête.", "Ou créez les pages vous-même : dans la navigation, ajoutez un menu déroulant « Français » et un « English », chacun avec les pages correspondantes (dupliquez chaque page, puis traduisez-la)."] },
    wix: { where: 'settings',
      en: ['Add Wix Multilingual, add French as a language, and show the language menu in your header.'],
      fr: ["Ajoutez Wix Multilingual, ajoutez l'anglais comme langue et affichez le menu de langues dans l'en-tête."] },
    wordpress: { where: 'settings',
      en: ['Use a multilingual plugin (e.g. WPML, Polylang or TranslatePress) and add its language switcher to your menu.'],
      fr: ['Utilisez une extension multilingue (p. ex. WPML, Polylang ou TranslatePress) et ajoutez son sélecteur de langue au menu.'] },
    generic: { where: 'content',
      en: ['Add a link to the matching page in the other language, usually at the top right.'],
      fr: ["Ajoutez un lien vers la page correspondante dans l'autre langue, généralement en haut à droite."] },
    code: '<a href="/fr/contact" lang="fr" hreflang="fr">Français</a>',
  },

  'ca-language-toggle-lang': {
    title: { en: 'The link to the other language is read with the wrong accent', fr: "Le lien vers l'autre langue est lu avec le mauvais accent" },
    why: { en: 'Screen readers pronounce the word using the page\'s language unless the link says otherwise.', fr: "Les lecteurs d'écran prononcent le mot selon la langue de la page, sauf si le lien indique le contraire." },
    squarespace: { where: 'codeinjection', snippet: LANG_SCRIPT,
      en: ['Squarespace navigation links can\'t be given a language directly. This snippet does it for you.', SQ_INJECT_PATH.en, 'If you use Weglot, check Weglot\'s switcher settings instead.'],
      fr: ["Les liens de navigation Squarespace ne peuvent pas recevoir de langue directement. Cet extrait le fait pour vous.", SQ_INJECT_PATH.fr, 'Si vous utilisez Weglot, vérifiez plutôt les réglages du sélecteur de Weglot.'] },
    wix: { where: 'codeinjection', snippet: LANG_SCRIPT,
      en: ['If you use Wix Multilingual\'s language menu, report it to Wix support.', 'Otherwise add this snippet. ' + WIX_CODE_PATH.en],
      fr: ['Si vous utilisez le menu de langues de Wix Multilingual, avisez le soutien de Wix.', 'Sinon, ajoutez cet extrait. ' + WIX_CODE_PATH.fr] },
    wordpress: { where: 'editor',
      en: ['Menu link: Appearance → Menus (or the Navigation block), and add lang="fr" if your theme allows link attributes; otherwise ask your multilingual plugin\'s support.', 'Link in a page: select it → ⋮ → Edit as HTML → add lang="fr".'],
      fr: ["Lien de menu : Apparence → Menus (ou le bloc Navigation), ajoutez lang=\"en\" si votre thème le permet; sinon, contactez le soutien de votre extension multilingue.", 'Lien dans une page : sélectionnez-le → ⋮ → Modifier en HTML → ajoutez lang="en".'] },
    generic: { where: 'editor', en: ['Add lang="fr" to the “Français” link (or lang="en" to “English”).'], fr: ['Ajoutez lang="en" au lien « English » (ou lang="fr" à « Français »).'] },
    code: '<a href="/fr/" lang="fr" hreflang="fr">Français</a>',
  },

  'ca-language-of-parts': {
    title: { en: 'Text in the other official language isn\'t marked', fr: "Du texte dans l'autre langue officielle n'est pas indiqué" },
    why: { en: 'Screen readers will read French text with English pronunciation (or the reverse), which is hard to understand.', fr: "Les lecteurs d'écran liront le texte anglais avec une prononciation française (ou l'inverse), ce qui est difficile à comprendre." },
    squarespace: { where: 'editor',
      en: ['Best: move the other-language text to your French (or English) pages.', 'If it must stay: replace the Text block with a Code block, choose HTML, and wrap the text like this: <p lang="fr">Votre texte…</p>.'],
      fr: ['Idéalement : déplacez le texte dans vos pages anglaises (ou françaises).', 'S\'il doit rester : remplacez le bloc Text par un bloc Code, choisissez HTML et entourez le texte ainsi : <p lang="fr">Votre texte…</p> pour du français, ou <p lang="en">…</p> pour de l\'anglais.'] },
    wix: { where: 'content',
      en: ['Wix can\'t mark a single paragraph as another language. Move the text to your French pages (Wix Multilingual), or put it in an Embed HTML element with lang="fr".'],
      fr: ['Wix ne permet pas d\'indiquer la langue d\'un seul paragraphe. Déplacez le texte dans les pages de l\'autre langue (Wix Multilingual), ou placez-le dans un élément Embed HTML avec lang="fr" ou lang="en".'] },
    wordpress: { where: 'editor',
      en: ['Select the paragraph → ⋮ (Options) → Edit as HTML → change <p> to <p lang="fr"> (French text) or <p lang="en"> (English text).'],
      fr: ['Sélectionnez le paragraphe → ⋮ (Options) → Modifier en HTML → remplacez <p> par <p lang="fr"> (texte français) ou <p lang="en"> (texte anglais).'] },
    generic: { where: 'editor', en: ['Wrap the other-language text in an element with a lang attribute.'], fr: ["Entourez le texte dans l'autre langue d'un élément avec un attribut lang."] },
    code: '<p lang="fr">Bienvenue sur notre site.</p>',
  },

  'ca-official-language': {
    title: { en: 'The page is not in English or French', fr: "La page n'est ni en français ni en anglais" },
    why: { en: 'Federal institutions must publish in both official languages.', fr: 'Les institutions fédérales doivent publier dans les deux langues officielles.' },
    generic: { where: 'settings', en: ['Check the site language setting, and make sure an English and a French version exist.'], fr: ["Vérifiez le réglage de langue du site, et assurez-vous qu'une version française et une version anglaise existent."] },
  },

  'ca-document-formats': {
    title: { en: 'PDF or Word files need checking', fr: 'Des fichiers PDF ou Word doivent être vérifiés' },
    why: { en: 'Many PDFs can\'t be read by screen readers. Canadian rules require accessible documents or another format on request.', fr: "Beaucoup de PDF ne peuvent pas être lus par les lecteurs d'écran. Les règles canadiennes exigent des documents accessibles ou un autre format sur demande." },
    generic: { where: 'external',
      en: ['Best: put the same content on a normal web page.', 'Or check each PDF: in Adobe Acrobat, use “Prepare for accessibility” / “Check for accessibility”. In Word, use Review → Check Accessibility before saving as PDF.', 'Say the file type and size in the link, e.g. “Annual report (PDF, 2 MB)”, and offer another format on request.'],
      fr: ['Idéalement : publiez le même contenu sur une page Web normale.', "Ou vérifiez chaque PDF : dans Adobe Acrobat, utilisez « Préparer pour l'accessibilité » / « Vérifier l'accessibilité ». Dans Word, utilisez Révision → Vérifier l'accessibilité avant d'enregistrer en PDF.", 'Indiquez le type et la taille du fichier dans le lien, p. ex. « Rapport annuel (PDF, 2 Mo) », et offrez un autre format sur demande.'] },
  },

  'ca-media-alternatives': {
    title: { en: 'Video or audio needs captions, a transcript and described video', fr: 'Une vidéo ou un audio a besoin de sous-titres, d\'une transcription et de vidéodescription' },
    why: { en: 'People who are Deaf, hard of hearing, blind or have low vision need another way to get the information.', fr: "Les personnes sourdes, malentendantes, aveugles ou ayant une basse vision ont besoin d'une autre façon d'obtenir l'information." },
    alias: 'video-caption',
    extra: { en: 'If important things are only shown and not said, add described video (a narrated description) or describe them in the transcript.', fr: "Si des éléments importants sont seulement montrés et non dits, ajoutez une vidéodescription ou décrivez-les dans la transcription." },
  },

  'ca-accessibility-statement': {
    title: { en: 'No accessibility page found', fr: "Aucune page sur l'accessibilité trouvée" },
    why: { en: 'The Accessible Canada Act and Ontario\'s AODA require organizations to publish their accessibility plan or policy.', fr: "La Loi canadienne sur l'accessibilité et la LAPHO de l'Ontario exigent la publication d'un plan ou d'une politique d'accessibilité." },
    squarespace: { where: 'content',
      en: ['In the Pages panel click + and add a blank page called “Accessibility”.', 'Write what you do for accessibility, any known problems, and how people can contact you.', 'Add a link to it in your footer so it\'s on every page.'],
      fr: ["Dans le panneau Pages, cliquez sur + et ajoutez une page vide nommée « Accessibilité ».", "Expliquez ce que vous faites pour l'accessibilité, les problèmes connus et comment vous joindre.", 'Ajoutez un lien vers cette page dans le pied de page pour qu\'il soit sur toutes les pages.'] },
    wix: { where: 'content',
      en: ['Add a page called “Accessibility” (Pages → + Add Page).', 'Write your accessibility statement and how to contact you.', 'Link it in your footer.'],
      fr: ['Ajoutez une page nommée « Accessibilité » (Pages → + Add Page).', "Rédigez votre énoncé d'accessibilité et comment vous joindre.", 'Ajoutez un lien dans le pied de page.'] },
    wordpress: { where: 'content',
      en: ['Pages → Add New → “Accessibility”.', 'Write your accessibility statement and how to contact you.', 'Add it to your footer menu.'],
      fr: ['Pages → Ajouter → « Accessibilité ».', "Rédigez votre énoncé d'accessibilité et comment vous joindre.", 'Ajoutez-la au menu du pied de page.'] },
    generic: { where: 'content',
      en: ['Publish an accessibility page (plan, statement or policy) and link to it from the footer of every page.'],
      fr: ["Publiez une page sur l'accessibilité (plan, énoncé ou politique) et ajoutez un lien dans le pied de page de chaque page."] },
  },

  'ca-feedback-process': {
    title: { en: 'No way to send accessibility feedback', fr: "Aucun moyen d'envoyer des commentaires sur l'accessibilité" },
    why: { en: 'The Accessible Canada Act and AODA require a way for people to tell you about barriers.', fr: "La Loi canadienne sur l'accessibilité et la LAPHO exigent un moyen de vous signaler des obstacles." },
    generic: { where: 'content',
      en: ['On your accessibility page, say how people can give feedback, and offer at least two ways: email, phone, and a form.', 'Link to it from your footer.'],
      fr: ["Sur votre page d'accessibilité, expliquez comment donner des commentaires et offrez au moins deux moyens : courriel, téléphone et formulaire.", 'Ajoutez un lien dans le pied de page.'] },
  },
};

R['html-lang-valid'] = { ...R['html-has-lang'], title: { en: 'The site\'s language setting is invalid', fr: 'Le réglage de langue du site est invalide' } };
R['select-name'] = { ...R.label, title: { en: 'Some dropdown menus have no label', fr: "Certains menus déroulants n'ont pas d'étiquette" } };
R['input-image-alt'] = { ...R['button-name'], title: { en: 'An image button has no description', fr: "Un bouton-image n'a pas de description" } };

// Rules caused by the site's code/template rather than content.
const TEMPLATE_RULES = /^(aria-|list$|listitem$|definition-list|dlitem|nested-interactive|scrollable-region-focusable|duplicate-id|svg-img-alt|role-img-alt|meta-viewport|bypass|landmark-|region$|tabindex|td-|th-|table-|frame-focusable|object-alt|area-alt|server-side-image-map|blink|marquee|meta-refresh|valid-lang|focus-order|presentation-role-conflict|empty-table-header|autocomplete-valid|summary-name|input-button-name)/;

const TEMPLATE_TEXT = {
  title: { en: 'A part of the page is built in a way screen readers can\'t understand', fr: "Une partie de la page est construite d'une façon que les lecteurs d'écran ne comprennent pas" },
  squarespace: { where: 'platform',
    en: ['This comes from Squarespace\'s own template code, not your content.', 'Report it to Squarespace support (Help → Contact Customer Care) and include the “For developers” details below.', 'If it is inside a Code or Embed block you added, edit that code instead.'],
    fr: ["Cela provient du code du gabarit de Squarespace, et non de votre contenu.", "Signalez-le au soutien de Squarespace (Help → Contact Customer Care) en joignant les détails « Pour les développeurs » ci-dessous.", "Si c'est dans un bloc Code ou Embed que vous avez ajouté, modifiez plutôt ce code."] },
  wix: { where: 'platform',
    en: ['This comes from Wix\'s own code or a Wix app, not your content.', 'Report it to Wix support and include the “For developers” details below.', 'If it is inside an Embed HTML element you added, edit that code instead.'],
    fr: ["Cela provient du code de Wix ou d'une application Wix, et non de votre contenu.", 'Signalez-le au soutien de Wix en joignant les détails « Pour les développeurs » ci-dessous.', "Si c'est dans un élément Embed HTML que vous avez ajouté, modifiez plutôt ce code."] },
  wordpress: { where: 'developer',
    en: ['This usually comes from your theme or a plugin.', 'Update your theme and plugins first. If it is still there, send the “For developers” details below to the theme or plugin author, or to your developer.'],
    fr: ["Cela provient habituellement de votre thème ou d'une extension.", "Mettez d'abord à jour votre thème et vos extensions. Si le problème persiste, envoyez les détails « Pour les développeurs » ci-dessous à l'auteur du thème ou de l'extension, ou à votre développeur."] },
  generic: { where: 'developer',
    en: ['This needs a change in the site\'s code.', 'Copy the fix prompt below into your AI builder (Lovable, Bolt, Cursor, ChatGPT…) or send the “For developers” details to your developer.'],
    fr: ['Cela exige une modification du code du site.', "Copiez la requête de correction ci-dessous dans votre outil IA (Lovable, Bolt, Cursor, ChatGPT…) ou envoyez les détails « Pour les développeurs » à votre développeur."] },
};

const PLATFORM_FAMILY = { squarespace: 'squarespace', wix: 'wix', wordpress: 'wordpress' };

/**
 * Plain-language guidance for one issue on one platform.
 * @returns {{title, why, where, steps, snippet, code, platformOwned}}
 */
export function guidanceFor(issue, platformId = 'unknown', lang = 'en', { inCode = false } = {}) {
  const fam = PLATFORM_FAMILY[platformId] || 'generic';
  let r = R[issue.id];
  const isTemplate = !r && TEMPLATE_RULES.test(issue.id);
  if (!r && isTemplate) r = TEMPLATE_TEXT;
  if (r?.alias) r = { ...R[r.alias], ...r };
  if (!r) {
    return { title: issue.help, why: null, where: 'developer', steps: [], snippet: null, code: null, platformOwned: false, plain: false };
  }
  let p = r[fam] || r.generic;
  // Template problem inside code the owner added: it's theirs to fix
  if (isTemplate && inCode && fam !== 'generic') p = {
    where: 'yourcode',
    en: ['This is inside a Code or Embed block you added. Edit that code, or paste the fix prompt below into ChatGPT or your AI builder to get corrected code.'],
    fr: ["C'est dans un bloc Code ou Embed que vous avez ajouté. Modifiez ce code, ou collez la requête ci-dessous dans ChatGPT ou votre outil IA pour obtenir un code corrigé."],
  };
  const steps = [...(p[lang] || p.en)];
  if (r.extra) steps.push(r.extra[lang] || r.extra.en);
  if (fam === 'generic' && (platformId === 'ai' || platformId === 'custom') && p.where !== 'developer') {
    steps.push(lang === 'fr' ? 'Vous utilisez un outil IA? Copiez la requête de correction ci-dessous et collez-la dans son clavardage.' : 'Using an AI builder? Copy the fix prompt below and paste it into its chat.');
  }
  return {
    title: r.title[lang] || r.title.en,
    why: r.why ? (r.why[lang] || r.why.en) : null,
    where: p.where,
    steps,
    snippet: p.snippet || null,
    code: r.code || null,
    platformOwned: p.where === 'platform',
    plain: true,
  };
}

// Older helper kept for compatibility
export function fixFor(id, lang = 'en') {
  const g = guidanceFor({ id, help: id }, 'unknown', lang);
  return g.plain ? { steps: g.steps, code: g.code } : null;
}
