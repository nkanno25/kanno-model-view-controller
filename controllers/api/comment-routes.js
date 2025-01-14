const router = require('express').Router();
const { Comment } = require('../../models');

router.get('/', (req, res) => {
    Comment.findAll()
        .then(response => res.json(response))
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        })
});

router.post('/', (req, res) => {
  if (req.session) {
    Comment.create({
          comment_text: req.body.comment_text,
          user_id: req.session.user_id,
          post_id: req.body.post_id
        })
          .then(response => res.json(response))
          .catch(err => {
              console.log(err);
              res.status(400).json(err);
        });
  }  

});

router.delete('/:id', (req, res) => {
    Comment.destroy({
        where: {
          id: req.params.id
        }
      })
        .then(response => {
          if (!response) {
            res.status(404).json({ message: 'No comment with this ID' });
            return;
          }
          res.json(response);
        })
        .catch(err => {
          console.log(err);
          res.status(500).json(err);
        })
});

module.exports = router;