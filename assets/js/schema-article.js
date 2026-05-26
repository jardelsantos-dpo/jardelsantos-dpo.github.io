<script>
document.addEventListener("DOMContentLoaded", function () {
  const dataScript = document.getElementById('article-data');
  if (!dataScript) {
    console.warn('Elemento #article-data não encontrado');
    return;
  }

  let article;
  try {
    article = JSON.parse(dataScript.textContent);
  } catch (e) {
    console.error('Schema Article JSON inválido', e);
    return;
  }

  if (document.querySelector('script[type="application/ld+json"][data-generated="true"]')) {
    return;
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.headline || "",
    "description": article.description || "",
    "image": article.image || "",
    "author": {
      "@type": "Person",
      "name": "Jardel Santos",
      "jobTitle": "Data Protection Officer (DPO)",
      "url": "https://jardelsantos-dpo.github.io/"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Jardel Santos",
      "logo": {
        "@type": "ImageObject",
        "url": "https://jardelsantos-dpo.github.io/favicon.png"
      }
    },
    "datePublished": article.datePublished || "",
    "dateModified": article.dateModified || "",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": article.url || window.location.href
    }
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-generated', 'true');
  script.text = JSON.stringify(schema);

  document.head.appendChild(script);
});
</script>