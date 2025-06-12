const express = require("express");
const router = express.Router();
const User = require("./Users");
const bcrypt = require("bcryptjs")

router.get("/admin/users", (req, res) => {
    User.findAll().then(users => {
        res.render("admin/users/index", {users: users});
    });
});

router.get("/admin/users/create", (req, res) => {
    res.render("admin/users/create");
});

router.post("/users/create", (req,res) => {
    var email = req.body.email;
    var password = req.body.password;

    User.findOne ({where:{email: email}}).then( user => {
        if(user == undefined){
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(password, salt);

            User.create({
                email: email,
                password: hash
            }).then(() => {
                res.redirect("/");
            }).catch ((err) => {
                res.redirect("/")
            });


        }else {
            res.redirect ("/admin/users/create");
        }
    });
});

router.get ("/login", (req,res) => {
    res.render("admin/users/login");
});

router.post("/authenticate", (req, res) => {
    var email = req.body.email;
    var password = req.body.password;

    User.findOne({where:{email: email}}).then(user => {
        if(user !=undefined){ //se existe usuário com este email
            //validar senha
            var correct = bcrypt.compareSync(password, user.password);

            if(correct){
                req.session.user = {
                    id: user.id,
                    email: user.email
                }
                res.redirect("admin/articles");
            }else{
                res.redirect("/login");
            }
        }else{
            res.redirect("/login");
        }
    });
}); // <--- Fechamento do router.post("/authenticate")

// Rota de logout corrigida - AGORA FORA DA ROTA DE AUTENTICAÇÃO
router.get("/logout", (req,res) => {
    // Para realmente "deslogar", você deve destruir a sessão, não apenas definir como undefined
    req.session.destroy((err) => {
        if(err){
            console.log("Erro ao destruir a sessão:", err);
            // Opcional: lidar com o erro de alguma forma
        }
        res.redirect("/");
    });
});


module.exports = router;