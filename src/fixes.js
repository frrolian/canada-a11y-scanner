// Plain-language "how to fix" steps for common problems, in English and French.
// Free, built in, and shown in every report.

const F = {
  'image-alt': {
    en: ['Add an alt attribute to the image that says what it shows or does, e.g. alt="Company logo".', 'If the image is only decoration, use an empty alt: alt="".', 'Do not start with "image of" or repeat nearby text.'],
    fr: ["Ajoutez un attribut alt qui décrit ce que l'image montre ou fait, p. ex. alt=\"Logo de l'entreprise\".", 'Si l\'image est décorative, utilisez un alt vide : alt="".', 'Ne commencez pas par « image de » et ne répétez pas le texte voisin.'],
    code: '<img src="logo.png" alt="Company logo">',
  },
  'color-contrast': {
    en: ['Make the text darker or the background lighter (or the reverse).', 'Normal text needs a contrast ratio of at least 4.5:1. Large text (24px, or 19px bold) needs 3:1.', 'Check your colours with a contrast checker before changing your brand colours.'],
    fr: ["Assombrissez le texte ou éclaircissez l'arrière-plan (ou l'inverse).", 'Le texte normal exige un contraste d\'au moins 4,5:1. Le grand texte (24 px, ou 19 px gras) exige 3:1.', 'Vérifiez vos couleurs avec un outil de contraste avant de modifier vos couleurs de marque.'],
  },
  label: {
    en: ['Give every form field a visible label connected to it.', 'Use <label for="id"> that matches the field\'s id. A placeholder is not a label.'],
    fr: ['Donnez à chaque champ de formulaire une étiquette visible qui y est associée.', 'Utilisez <label for="id"> correspondant à l\'id du champ. Un texte indicatif (placeholder) ne remplace pas une étiquette.'],
    code: '<label for="email">Email address</label>\n<input id="email" type="email" autocomplete="email">',
  },
  'link-name': {
    en: ['Every link needs text that says where it goes.', 'For icon-only links, add aria-label, e.g. aria-label="Facebook".', 'Avoid vague text like "click here" or "read more".'],
    fr: ['Chaque lien doit avoir un texte qui indique sa destination.', 'Pour les liens avec seulement une icône, ajoutez aria-label, p. ex. aria-label="Facebook".', 'Évitez les textes vagues comme « cliquez ici » ou « en savoir plus ».'],
    code: '<a href="https://facebook.com/example" aria-label="Facebook">\n  <svg aria-hidden="true">…</svg>\n</a>',
  },
  'button-name': {
    en: ['Every button needs a name that says what it does.', 'Put text inside the button, or add aria-label for icon-only buttons.'],
    fr: ['Chaque bouton doit avoir un nom qui indique son action.', 'Mettez du texte dans le bouton, ou ajoutez aria-label pour les boutons avec seulement une icône.'],
    code: '<button type="button" aria-label="Close menu">✕</button>',
  },
  'html-has-lang': {
    en: ['Add the page language to the <html> tag: lang="en" for English or lang="fr" for French.'],
    fr: ['Ajoutez la langue de la page à la balise <html> : lang="fr" pour le français ou lang="en" pour l\'anglais.'],
    code: '<html lang="en">',
  },
  'html-lang-valid': {
    en: ['Use a valid language code on <html>, such as "en", "en-CA", "fr" or "fr-CA".'],
    fr: ['Utilisez un code de langue valide sur <html>, comme « fr », « fr-CA », « en » ou « en-CA ».'],
  },
  'document-title': {
    en: ['Give each page a unique <title> that describes it, e.g. "Contact us | Company name".'],
    fr: ['Donnez à chaque page un <title> unique qui la décrit, p. ex. « Nous joindre | Nom de l\'entreprise ».'],
  },
  bypass: {
    en: ['Add a "Skip to main content" link as the first thing on the page.', 'Wrap your main content in a <main> element.'],
    fr: ['Ajoutez un lien « Passer au contenu principal » au tout début de la page.', 'Placez le contenu principal dans un élément <main>.'],
    code: '<a class="skip-link" href="#main">Skip to main content</a>\n…\n<main id="main">…</main>',
  },
  'frame-title': {
    en: ['Add a title to every iframe that says what it contains, e.g. title="Map of our office".'],
    fr: ['Ajoutez un titre à chaque iframe qui décrit son contenu, p. ex. title="Carte de notre bureau".'],
  },
  'video-caption': {
    en: ['Add captions to every video with a <track kind="captions"> file, or turn on captions in your video player.', 'Auto-generated captions must be checked and corrected.'],
    fr: ['Ajoutez des sous-titres à chaque vidéo avec un fichier <track kind="captions">, ou activez-les dans votre lecteur vidéo.', 'Les sous-titres automatiques doivent être vérifiés et corrigés.'],
    code: '<video controls>\n  <source src="intro.mp4">\n  <track kind="captions" src="intro.en.vtt" srclang="en" label="English">\n</video>',
  },
  'select-name': {
    en: ['Connect a visible <label> to every dropdown (select).'],
    fr: ['Associez une étiquette <label> visible à chaque liste déroulante (select).'],
  },
  'input-image-alt': {
    en: ['Image buttons need alt text that says what the button does, e.g. alt="Search".'],
    fr: ['Les boutons-images ont besoin d\'un texte alt qui indique l\'action, p. ex. alt="Rechercher".'],
  },
  list: {
    en: ['Lists (<ul> and <ol>) may only contain <li> items directly.'],
    fr: ['Les listes (<ul> et <ol>) ne peuvent contenir directement que des éléments <li>.'],
  },
  listitem: {
    en: ['Place each <li> inside a <ul> or <ol>.'],
    fr: ['Placez chaque <li> dans un <ul> ou un <ol>.'],
  },
  'meta-viewport': {
    en: ['Allow people to zoom. Remove user-scalable=no and maximum-scale=1 from the viewport meta tag.'],
    fr: ['Permettez le zoom. Retirez user-scalable=no et maximum-scale=1 de la balise meta viewport.'],
    code: '<meta name="viewport" content="width=device-width, initial-scale=1">',
  },
  'aria-hidden-focus': {
    en: ['Elements hidden with aria-hidden="true" must not contain links, buttons or fields people can tab to.', 'Remove aria-hidden, or make the inner controls unfocusable (tabindex="-1") when hidden.'],
    fr: ['Les éléments masqués avec aria-hidden="true" ne doivent pas contenir de liens, boutons ou champs atteignables au clavier.', 'Retirez aria-hidden, ou rendez les contrôles internes non focalisables (tabindex="-1") lorsqu\'ils sont masqués.'],
  },
  'aria-required-attr': {
    en: ['This ARIA role needs extra attributes to work. Add the missing attribute listed below, or use a native HTML element instead.'],
    fr: ['Ce rôle ARIA exige des attributs supplémentaires. Ajoutez l\'attribut manquant indiqué ci-dessous, ou utilisez plutôt un élément HTML natif.'],
  },
  'aria-valid-attr-value': {
    en: ['An ARIA attribute has a value that is not allowed. Fix the value, e.g. aria-expanded must be "true" or "false".'],
    fr: ['Un attribut ARIA a une valeur non permise. Corrigez la valeur, p. ex. aria-expanded doit être « true » ou « false ».'],
  },
  'nested-interactive': {
    en: ['Do not put a link or button inside another link or button. Separate them.'],
    fr: ['Ne placez pas un lien ou un bouton à l\'intérieur d\'un autre lien ou bouton. Séparez-les.'],
  },
  'target-size': {
    en: ['Make buttons and links at least 24 by 24 pixels, or leave enough space around small ones.'],
    fr: ['Les boutons et liens doivent mesurer au moins 24 × 24 pixels, ou avoir assez d\'espace autour.'],
  },
  'autocomplete-valid': {
    en: ['Use a correct autocomplete value on personal-information fields, e.g. autocomplete="email" or "postal-code".'],
    fr: ['Utilisez une valeur autocomplete correcte pour les champs d\'information personnelle, p. ex. autocomplete="email" ou "postal-code".'],
  },
  'link-in-text-block': {
    en: ['Links inside paragraphs must stand out without relying on colour alone. Underline them.'],
    fr: ['Les liens dans les paragraphes doivent se distinguer autrement que par la couleur. Soulignez-les.'],
  },
  'scrollable-region-focusable': {
    en: ['Areas that scroll must be reachable by keyboard. Add tabindex="0" and a label to the scrolling area.'],
    fr: ['Les zones défilantes doivent être accessibles au clavier. Ajoutez tabindex="0" et une étiquette à la zone.'],
  },
  'svg-img-alt': {
    en: ['Give meaningful SVG images role="img" and a name with aria-label or a <title> inside.'],
    fr: ['Donnez aux images SVG significatives role="img" et un nom avec aria-label ou un <title> intérieur.'],
  },
  // Canada-specific checks
  'ca-language-toggle': {
    en: ['Add a link to the French (or English) version of the page, usually at the top right.', 'Point it at the matching page in the other language, not the home page.'],
    fr: ['Ajoutez un lien vers la version anglaise (ou française) de la page, généralement en haut à droite.', "Faites-le pointer vers la page correspondante dans l'autre langue, pas vers l'accueil."],
    code: '<a href="/fr/contact" lang="fr" hreflang="fr">Français</a>',
  },
  'ca-language-toggle-lang': {
    en: ['Add lang="fr" to the "Français" link (or lang="en" to the "English" link) so screen readers pronounce it correctly.'],
    fr: ['Ajoutez lang="en" au lien « English » (ou lang="fr" au lien « Français ») pour que les lecteurs d\'écran le prononcent correctement.'],
    code: '<a href="/fr/" lang="fr" hreflang="fr">Français</a>',
  },
  'ca-language-of-parts': {
    en: ['Wrap text in the other official language in an element with a lang attribute.'],
    fr: ["Entourez le texte dans l'autre langue officielle d'un élément avec un attribut lang."],
    code: '<p lang="fr">Bienvenue sur notre site.</p>',
  },
  'ca-official-language': {
    en: ['Make sure an English and a French version of this content exist if you are a federal institution.'],
    fr: ['Assurez-vous qu\'une version française et une version anglaise de ce contenu existent si vous êtes une institution fédérale.'],
  },
  'ca-document-formats': {
    en: ['Check each PDF or Office file is tagged and accessible, or publish the same content as a web page.', 'Say the file type and size in the link, e.g. "Annual report (PDF, 2 MB)".', 'Offer another format on request.'],
    fr: ['Vérifiez que chaque fichier PDF ou Office est balisé et accessible, ou publiez le même contenu en page Web.', 'Indiquez le type et la taille du fichier dans le lien, p. ex. « Rapport annuel (PDF, 2 Mo) ».', 'Offrez un autre format sur demande.'],
  },
  'ca-media-alternatives': {
    en: ['Add accurate captions to every video.', 'Add described video (audio description) when important things are only shown, not said.', 'Provide a text transcript.'],
    fr: ['Ajoutez des sous-titres exacts à chaque vidéo.', "Ajoutez la vidéodescription lorsque des éléments importants sont seulement montrés, pas dits.", 'Fournissez une transcription textuelle.'],
  },
  'ca-accessibility-statement': {
    en: ['Publish an accessibility page (your plan, statement or policy) and link to it from the footer of every page.'],
    fr: ["Publiez une page sur l'accessibilité (plan, déclaration ou politique) et ajoutez un lien dans le pied de page de chaque page."],
  },
  'ca-feedback-process': {
    en: ['Explain how people can give feedback about accessibility, and offer email, phone and a form.', 'Link to it from the accessibility page and the footer.'],
    fr: ["Expliquez comment donner de la rétroaction sur l'accessibilité, en offrant courriel, téléphone et formulaire.", "Ajoutez un lien depuis la page sur l'accessibilité et le pied de page."],
  },
};

export function fixFor(id, lang = 'en') {
  const f = F[id];
  if (!f) return null;
  return { steps: f[lang] || f.en, code: f.code || null };
}
