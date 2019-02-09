// dependencies
const express = require('express');

// models
const Story = require('../models/story');
const Comment = require('../models/comment');

const router = express.Router();

// api endpoints
router.get('/stories', function(req, res) {
  Story.find({}).then(stories => {
    res.send(stories);
  });
});

router.post('/story', function(req, res) {
    const newStory = new Story({
      'creator_name': req.body.name !== undefined ? req.body.name : 'Anonymous',
      'content': req.body.content,
    });

    if (newStory.content != '') {
      newStory.save().then(story => {
          const io = req.app.get('socketio');
          io.emit('story', story);
      }).catch(err => {
          // An error occurred!
          console.log(err);
      });
    }
    
    res.send({});
  }
);

router.get('/comment', function(req, res) {
  Comment.find({ parent: req.query.parent }).then(comments => {
    res.send(comments);
  });
});

router.post(
  '/comment',
  function(req, res) {
    const newComment = new Comment({
      'creator_name': req.body.name !== undefined ? req.body.name : 'Anonymous',
      'parent': req.body.parent,
      'content': req.body.content,
    });

    if (newComment.content != '') {
      newComment.save().then(comment => {
        const io = req.app.get('socketio');
        io.emit("comment", comment);
      }).catch(err => {
        console.log(err);
      });
    }

    res.send({});
  }
);
module.exports = router;
