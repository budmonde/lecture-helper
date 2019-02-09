function setNameDOMObject() {
  const nameDiv = document.createElement('div');
  nameDiv.className = 'input-group my-3';

  const nameContent = document.createElement('input');
  nameContent.setAttribute('type', 'text');
  nameContent.setAttribute('placeholder', 'Your Name');
  nameContent.setAttribute('value', 'Anonymous');
  nameContent.className = 'form-control';
  nameContent.setAttribute('id', 'set-name-input');
  nameDiv.appendChild(nameContent);

  return nameDiv;
}

function storyDOMObject(storyJSON) {
  const card = document.createElement('div');
  card.setAttribute('id', storyJSON._id);
  card.className = 'story card';

  const cardBody = document.createElement('div');
  cardBody.className = 'card-body';
  card.appendChild(cardBody);

  const creatorSpan = document.createElement('span');
  creatorSpan.className = 'story-creator card-title';
  creatorSpan.innerText = storyJSON.creator_name;
  cardBody.appendChild(creatorSpan);

  const contentSpan = document.createElement('p');
  contentSpan.className = 'story-content card-text';
  contentSpan.innerText = storyJSON.content;
  cardBody.appendChild(contentSpan);

  const cardFooter = document.createElement('div');
  cardFooter.className = 'card-footer';
  card.appendChild(cardFooter);

  const commentsDiv = document.createElement('div');
  commentsDiv.setAttribute('id', storyJSON._id + '-comments');
  commentsDiv.className = 'story-comments';
  cardFooter.appendChild(commentsDiv);

  cardFooter.appendChild(newCommentDOMObject(storyJSON._id));

  return card;
}

function commentDOMObject(commentJSON) {
  commentDiv = document.createElement('div');
  commentDiv.setAttribute('id', commentJSON._id);
  commentDiv.className = 'comment mb-2';

  commentCreatorSpan = document.createElement('span');
  commentCreatorSpan.className = 'comment-creator';
  commentCreatorSpan.innerText = commentJSON.creator_name;
  commentDiv.appendChild(commentCreatorSpan);

  commentContentSpan = document.createElement('span');
  commentContentSpan.className = 'comment-content';
  commentContentSpan.innerText = ' | ' + commentJSON.content;
  commentDiv.appendChild(commentContentSpan);

  return commentDiv;
}

function newCommentDOMObject(parent) {
  const newCommentDiv = document.createElement('div');
  newCommentDiv.className = 'comment input-group';

  const newCommentContent = document.createElement('input');
  newCommentContent.setAttribute('type', 'text');
  newCommentContent.setAttribute('name', 'content');
  newCommentContent.setAttribute('placeholder', 'Your Response/Follow-up');
  newCommentContent.setAttribute('id', parent + '-comment-input');
  newCommentContent.className = 'form-control';
  newCommentDiv.appendChild(newCommentContent);

  const newCommentParent = document.createElement('input');
  newCommentParent.setAttribute('type', 'hidden');
  newCommentParent.setAttribute('name', 'parent');
  newCommentParent.setAttribute('value', parent);
  newCommentDiv.appendChild(newCommentParent);

  const newCommentButtonDiv = document.createElement('div');
  newCommentButtonDiv.className = 'input-group-append';
  newCommentDiv.appendChild(newCommentButtonDiv);

  const newCommentSubmit = document.createElement('button');
  newCommentSubmit.innerHTML = 'Submit';
  newCommentSubmit.className = 'btn btn-outline-dark';
  newCommentSubmit.setAttribute('story-id', parent);
  newCommentSubmit.addEventListener('click', submitCommentHandler);
  newCommentButtonDiv.appendChild(newCommentSubmit);

  return newCommentDiv;
}

function submitCommentHandler() {
  const nameInput = document.getElementById('set-name-input');
  const commentInput = document.getElementById(this.getAttribute('story-id') + '-comment-input');

  const data = {
    name: nameInput.value,
    content: commentInput.value,
    parent: this.getAttribute('story-id')
  };

  post('/api/comment', data);
  commentInput.value = '';
}

function newStoryDOMObject() {
  const newStoryDiv = document.createElement('div');
  newStoryDiv.className = 'input-group my-3';

  const newStoryContent = document.createElement('input');
  newStoryContent.setAttribute('type', 'text');
  newStoryContent.setAttribute('placeholder', 'New Question');
  newStoryContent.className = 'form-control';
  newStoryContent.setAttribute('id', 'story-content-input')
  newStoryDiv.appendChild(newStoryContent);

  const newStoryButtonDiv = document.createElement('div');
  newStoryButtonDiv.className = 'input-group-append';
  newStoryDiv.appendChild(newStoryButtonDiv);

  const newStorySubmit = document.createElement('button');
  newStorySubmit.innerHTML = 'Submit';
  newStorySubmit.className = 'btn btn-outline-dark';
  newStorySubmit.addEventListener('click', submitStoryHandler);
  newStoryButtonDiv.appendChild(newStorySubmit);

  return newStoryDiv;
}

function submitStoryHandler() {
  const nameInput = document.getElementById('set-name-input');
  const newStoryInput = document.getElementById('story-content-input');

  const data = {
    name: nameInput.value,
    content: newStoryInput.value,
  };

  post('/api/story', data);
  newStoryInput.value = '';
}

function renderStories() {
  document.getElementById('set-user').appendChild(setNameDOMObject());
  document.getElementById('new-story').appendChild(newStoryDOMObject());

  const storiesDiv = document.getElementById('stories');
  get('/api/stories', {}).then(stories => {
    for (const story of stories) {
      storiesDiv.prepend(storyDOMObject(story));
    }

    // Fire GET /api/comment for every story
    return Promise.all(stories.map(story => get('/api/comment', {'parent': story._id})));
  }).then(responses => {
    // Callback when all comment requests are completed
    for (const res of responses) { // each 'res' is an array of comments
      for (const comment of res) {
        const commentDiv = document.getElementById(comment.parent + '-comments');
        commentDiv.appendChild(commentDOMObject(comment));
      }
    }
  });
}
