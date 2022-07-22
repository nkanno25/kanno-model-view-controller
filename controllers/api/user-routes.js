const router = require('express').Router();
const { User, Post } = require('../../models');

// get all
router.get('/', (req, res) => {
    User.findAll({
        attributes: { exclude: ['password'] }
    })
        .then(response => res.json(response))
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
});

router.get('/:id', (req, res) => {
    User.findOne({
        attributes: { exclude: ['password'] },
        include: [
            {
              model: Post,
              attributes: ['id', 'title', 'created_at']
            },
            {
                model: Comment,
                attributes: ['id', 'comment_text', 'created_at'],
                include: {
                  model: Post,
                  attributes: ['title']
                }
            }
        ],
        where: {
            id: req.params.id
        }
    })
    .then(response => {
        if (!response) {
            res.status(404).json({ message: 'No user with this ID'});
            return; 
        }
        res.json(response);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

router.post('/', (req, res) => {
    User.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    })
    .then(response => {
            req.session.save(() => {
            req.session.user_id = response.id;
            req.session.username = response.username;
            req.session.loggedIn = true;

            res.json(response);
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err); 
    }); 
});

router.post('/login', (req, res) => {
    User.findOne({
        where: {
            email: req.body.email
        }
    }).then(response => {
        if(!response) {
            res.status(400).json({ message: 'No user with this email' });
            return;
        }
        
        const validPassword = response.checkPassword(req.body.password);

        if(!validPassword) {
            res.status(400).json({ message: 'Incorrect password' });
            return;
        }
        req.session.save(() => {
            req.session.user_id = response.id;
            req.session.username = response.username;
            req.session.loggedIn = true;
      
            res.json({ user: response, message: 'You are logged in' });
        });
    }); 
});

router.post('/logout', (req, res) => {
    if (req.session.loggedIn) {
        req.session.destroy(() => {
            res.status(204).end();
        });
    } else {
        res.status(404).end();
    }
});

router.put('/:id', (req, res) => {
    User.update(req.body, {
        individualHooks: true,
        where: {
            id: req.params.id
        }
    })
        .then(response => {
            if (!response[0]) {
                res.status(404).json({ message: 'No user with this ID' });
                return;
            }
            res.json(response);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
}); 

router.delete('/:id', (req, res) => {
    User.destroy({
        where: {
            id: req.params.id
        }
    })
        .then(response => {
            if(!response) {
                res.status(404).json({ message: 'No user with this ID '});
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