addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const links = [
  {
    'name': 'Cloudflare\'s most underrated product',
    'url': 'https://www.cloudflare.com/distributed-web-gateway/'
  },
  {
    'name': 'A Brief, Incomplete, and Mostly Wrong History of Programming Languages',
    'url': 'http://james-iry.blogspot.com/2009/05/brief-incomplete-and-mostly-wrong.html'
  },
  {
    'name': 'Sky: Children of the Light',
    'url': 'https://thatskygame.com'
  },
];

const socialLinks = [
  {
    'svg': 'https://simpleicons.org/icons/linkedin.svg',
    'url': 'https://www.linkedin.com/in/bennett-ramirez-705246109/'
  },
  {
    'svg': 'https://simpleicons.org/icons/github.svg',
    'url': 'https://github.com/oldmud0'
  }
]

/**
 * Respond to the request
 * @param {Request} request
 */
async function handleRequest(request) {
  const url = new URL(request.url);

  if (url.pathname == '/links') {
    return new Response(JSON.stringify(links), {
      status: 200,
      headers: {
        'content-type': 'application/json'
      }
    });
  }

  const res = await fetch('https://static-links-page.signalnerve.workers.dev');
  await Promise.all(
    socialLinks.map(link => fetch(link.svg)
      .then(res => res.text())
      .then(text => link.svgRendered = text))
  );

  return new HTMLRewriter()
    .on('div#links', {
      element(elem) {
        for (const link of links) {
          // (We assume url and name are properly escaped here)
          elem.append(`<a href="${link.url}">${link.name}</a>`, { html: true });
        }
      }
    })
    .on('div#profile', {
      element(elem) {
        elem.removeAttribute('style');
      }
    })
    .on('img#avatar', {
      element(elem) {
        elem.setAttribute('src', 'https://www.cs.utexas.edu/~bramg/profile.jpg');
      }
    })
    .on('h1#name', {
      element(elem) {
        elem.setInnerContent('Bennett Ramirez (oldmud0)');
      }
    })
    .on('div#social', {
      element(elem) {
        elem.removeAttribute('style');
        const linkElems = socialLinks.map(link =>
          `<a href="${link.url}">${link.svgRendered}</a>`
        ).join('');
        // Can't use div id 'links' - otherwise things break badly.
        elem.append(`<div id="social-links">${linkElems}</div>`, { html: true });
      }
    })
    .on('style', {
      element(elem) {
        // Not in the requirements, but makes it look nicer.
        elem.append('div#social-links svg { height: 64px; }', { html: true });
      }
    })
    .on('title', {
      element(elem) {
        elem.setInnerContent('Bennett Ramirez');
      }
    })
    .on('body', {
      element(elem) {
        elem.setAttribute('class', 'bg-blue-300');
      }
    }).transform(res);
}
