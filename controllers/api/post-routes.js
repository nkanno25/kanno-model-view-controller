const router = require('express').Router();
const { Post, User, Comment } = require('../../models');
const withAuth = require('../../utils/auth');

// get all
router.get('/', (req, res) => {
    Post.findAll({
        attributes: ['id', 'title', 'post_text', 'created_at'],
        order: [[ 'created_at', 'DESC' ]],
        include: [
            {
                model: Comment,
                attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
                include: {
                  model: User,
                  attributes: ['username']
                }
            },
            {
                model: User,
                attributes: ['username']
            }
        ]
    })
        .then(response => res.json(response))
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
}); 

router.get('/:id', (req, res) => {
    Post.findOne({
        where: {
            id: req.params.id
        },
        attributes: ['id', 'title', 'post_text', 'created_at'],
        include: [
            {
                model: Comment,
                attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
                include: {
                  model: User,
                  attributes: ['username']
                }
            },
            {
                model: User,
                attributes: ['username']
            }
        ]
    })
        .then(response => {
            if(!response) {
                res.status(404).json({ message: 'No post with this ID' });
                return;
            }
            res.json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

router.post('/', withAuth, (req, res) => {
    Post.create({
        title: req.body.title,
        post_text: req.body.post_text,
        user_id: req.session.user_id
    })
        .then(response => res.json(response))
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

router.put('/:id', withAuth, (req, res) => {
    Post.update(
        {
            title: req.body.title,
            post_text: req.body.post_text,
        },
        {
            where: {
                id: req.params.id
            }
        }
    ).then(response => {
            if(!response) {
                res.status(404).json({ message: 'No post with this ID' });
                return;
            }
            res.json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

router.delete('/:id', withAuth, (req, res) => {
    //delete all associated comments
    Comment.destroy({
        where: {
            post_id: req.params.id
        }
    }).then(() => {
    //then delete the post
       Post.destroy({
      where: {
        id: req.params.id
      }
    }) 
    })   
      .then(response => {
        if (!response) {
          res.status(404).json({ message: 'No post with this ID' });
          return;
        }
        res.json(response);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
});

module.exports = router;