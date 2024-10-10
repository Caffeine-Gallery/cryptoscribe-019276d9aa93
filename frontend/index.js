import { backend } from 'declarations/backend';

let quill;

document.addEventListener('DOMContentLoaded', async () => {
  quill = new Quill('#editor', {
    theme: 'snow'
  });

  const newPostBtn = document.getElementById('newPostBtn');
  const newPostForm = document.getElementById('newPostForm');
  const postForm = document.getElementById('postForm');
  const homeLink = document.getElementById('homeLink');

  newPostBtn.addEventListener('click', () => {
    newPostForm.style.display = 'block';
    document.getElementById('posts').style.display = 'none';
    document.getElementById('singlePost').style.display = 'none';
  });

  homeLink.addEventListener('click', (e) => {
    e.preventDefault();
    loadPosts();
  });

  postForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const body = quill.root.innerHTML;

    await backend.addPost(title, body, author);
    postForm.reset();
    quill.setContents([]);
    newPostForm.style.display = 'none';
    await loadPosts();
  });

  window.addEventListener('hashchange', handleRouting);
  handleRouting();
});

async function loadPosts() {
  const posts = await backend.getPosts();
  const postsContainer = document.getElementById('posts');
  postsContainer.innerHTML = '';
  postsContainer.style.display = 'block';
  document.getElementById('singlePost').style.display = 'none';
  document.getElementById('newPostForm').style.display = 'none';

  posts.forEach(post => {
    const postElement = document.createElement('article');
    postElement.className = 'post';
    postElement.innerHTML = `
      <h2><a href="#post/${post.id}">${post.title}</a></h2>
      <p class="author">By ${post.author}</p>
      <div class="content">${truncateHTML(post.body, 150)}</div>
      <p class="timestamp">${new Date(Number(post.timestamp) / 1000000).toLocaleString()}</p>
      <a href="#post/${post.id}" class="read-more">Read More</a>
    `;
    postsContainer.appendChild(postElement);
  });
}

async function loadSinglePost(id) {
  const post = await backend.getPost(Number(id));
  const singlePostContainer = document.getElementById('singlePost');
  document.getElementById('posts').style.display = 'none';
  document.getElementById('newPostForm').style.display = 'none';
  singlePostContainer.style.display = 'block';

  if (post) {
    singlePostContainer.innerHTML = `
      <article class="post">
        <h2>${post.title}</h2>
        <p class="author">By ${post.author}</p>
        <div class="content">${post.body}</div>
        <p class="timestamp">${new Date(Number(post.timestamp) / 1000000).toLocaleString()}</p>
      </article>
    `;
  } else {
    singlePostContainer.innerHTML = '<p>Post not found</p>';
  }
}

function handleRouting() {
  const hash = window.location.hash;
  if (hash.startsWith('#post/')) {
    const id = hash.split('/')[1];
    loadSinglePost(id);
  } else {
    loadPosts();
  }
}

function truncateHTML(html, maxLength) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  if (tmp.textContent.length <= maxLength) return html;
  
  let truncated = '';
  const words = tmp.innerHTML.split(' ');
  for (let word of words) {
    if ((truncated + word).length <= maxLength) {
      truncated += word + ' ';
    } else {
      break;
    }
  }
  return truncated.trim() + '...';
}
