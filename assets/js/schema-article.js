<script>
(function () {
  const dataScript = document.getElementById('article-data');
  if (!dataScript) return;

  let article;
  try {
    article = JSON.parse(dataScript.textContent);
  } catch (e) {
    console.error('Schema Article JSON inválido');
    return;
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.headline,
    "description": article.description,
    "image": article.image,
    "author": {
      "@type": "Person",
      "name": "Jardel Santos",
      "jobTitle": "Data Protection Officer (DPO)",
      "url": "https://jardelsantos-dpo.github.io/"
    },
    "publisher": {
      "@type": "Person",
      "name": "Jardel Santos",
      "logo": {
        "@type": "ImageObject",
        "url": "https://jardelsantos-dpo.github.io/favicon.png"
      }
    },
    "datePublished": article.datePublished,
    "dateModified": article.dateModified,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": article.url
    }
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.text = JSON.stringify(schema);

  document.head.appendChild(script);
})();
</script>
