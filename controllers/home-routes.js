const router = require('express').Router();
const { response } = require('express');
const sequelize = require('../config/connection');
const { Post, User, Comment } = require('../models');
const dashboardRoutes = require('./dashboard-routes.js');

router.use('/dashboard', dashboardRoutes);

router.get('/', (req, res) => {
    console.log(req.session);
    Post.findAll({
        attributes: [
          'id',
          'post_text',
          'title',
          'created_at',
        ],
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
        const posts = response.map(post => post.get({ plain: true }));
        res.render('homepage', { 
            posts,
            loggedIn: req.session.loggedIn });
    }) 
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

router.get('/login', (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/');
        return;
    }

    res.render('login');
});

router.get('/post/:id', (req, res) => {
    Post.findOne({
        where: {
          id: req.params.id
        },
        attributes: [
          'id',
          'post_text',
          'title',
          'created_at'        
        ],
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
          if (!response) {
            res.status(404).json({ message: 'No post with this ID' });
            return;
          }
    
          const post = response.get({ plain: true });
    
          res.render('single-post', { 
            post, 
            loggedIn: req.session.loggedIn
            })
        })
        .catch(err => {
          console.log(err);
          res.status(500).json(err);
        });
});

module.exports = router;