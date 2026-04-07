/* Esse código tem o intuito de incluir a movimentação da Sophia e do Asimov por todo o jogo.
   Nela está contida a desaceleração e todas as direções que ela pode seguir.
   movimentacaoSophia(cena, sprite, animacoes, colisao)
*/

export function registrarControles(cena) {
    cena.cursors  = cena.input.keyboard.createCursorKeys();
    cena.keys     = cena.input.keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        S: Phaser.Input.Keyboard.KeyCodes.S,
        D: Phaser.Input.Keyboard.KeyCodes.D
    });
    cena.keySpace = cena.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    cena.teclaE   = cena.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    cena.pulando  = false;
}

export function movimentacaoSophia(cena, sprite, animacoes, colisaoFn = null) {
    let atrito = 0.8;          // percentual de redução de velocidade por frame
    let velocidadeImpulso = 30; // o quanto a velocidade aumenta por frame
    let velocidadeMax = 150;    // limite para o personagem não acelerar infinitamente
    let movimentacao = false;

    // a cada frame, a velocidade vai estar percentualmente menor, até o personagem parar
    sprite.body.velocity.x *= atrito;
    sprite.body.velocity.y *= atrito;

    if (cena.cursors.left.isDown || cena.keys.A.isDown) {
        if (!colisaoFn || !colisaoFn(sprite.x - velocidadeImpulso, sprite.y)) {
            sprite.body.velocity.x -= velocidadeImpulso;
        }
        sprite.anims.play(animacoes.left, true);
        movimentacao = true;
    } else if (cena.cursors.right.isDown || cena.keys.D.isDown) {
        if (!colisaoFn || !colisaoFn(sprite.x + velocidadeImpulso, sprite.y)) {
            sprite.body.velocity.x += velocidadeImpulso;
        }
        sprite.anims.play(animacoes.right, true);
        movimentacao = true;
    }

    if (cena.cursors.up.isDown || cena.keys.W.isDown) {
        if (!colisaoFn || !colisaoFn(sprite.x, sprite.y - velocidadeImpulso)) {
            sprite.body.velocity.y -= velocidadeImpulso;
        }
        if (!movimentacao) sprite.anims.play(animacoes.back, true);
        movimentacao = true;
    } else if (cena.cursors.down.isDown || cena.keys.S.isDown) {
        if (!colisaoFn || !colisaoFn(sprite.x, sprite.y + velocidadeImpulso)) {
            sprite.body.velocity.y += velocidadeImpulso;
        }
        if (!movimentacao) sprite.anims.play(animacoes.front, true);
        movimentacao = true;
    }

    // a função utilizada estabelece limites de velocidade ao personagem
    sprite.body.velocity.x = Phaser.Math.Clamp(sprite.body.velocity.x, -velocidadeMax, velocidadeMax);
    sprite.body.velocity.y = Phaser.Math.Clamp(sprite.body.velocity.y, -velocidadeMax, velocidadeMax);

    // normaliza a velocidade na diagonal para não ultrapassar velocidadeMax
    const mag = Math.sqrt(sprite.body.velocity.x ** 2 + sprite.body.velocity.y ** 2);
    if (mag > velocidadeMax) {
        sprite.body.velocity.x = (sprite.body.velocity.x / mag) * velocidadeMax;
        sprite.body.velocity.y = (sprite.body.velocity.y / mag) * velocidadeMax;
    }

    // se o jogador não estiver apertando nenhum botão e a velocidade estiver bem baixa, o personagem para
    if (!movimentacao && Math.abs(sprite.body.velocity.x) < 5 && Math.abs(sprite.body.velocity.y) < 5) {
        sprite.body.velocity.x = 0;
        sprite.body.velocity.y = 0;
        sprite.anims.stop();
    }
}

export function puloSophia(cena, sprite, colisaoFn = null) {
    if (Phaser.Input.Keyboard.JustDown(cena.keySpace) && !cena.pulando) {
        cena.pulando = true;
        cena.puloVelocidade = -6;
        cena.puloYInicial = sprite.y;
    }

    if (cena.pulando) {
        const novoY = sprite.y + cena.puloVelocidade;
        if (!colisaoFn || !colisaoFn(sprite.x, novoY)) {
            sprite.y = novoY;
        }
        cena.puloVelocidade += 0.4;
        if (sprite.y >= cena.puloYInicial) {
            sprite.y = cena.puloYInicial;
            cena.pulando = false;
        }
    }
}

export function movimentacaoAsimov(cena, asimov, alvo, colisaoFn = null) {
    let distMin = 60;
    let velAsimov = 2.4;

    let dx = alvo.x - asimov.x;
    let dy = alvo.y - asimov.y;
    let distancia = Math.sqrt(dx * dx + dy * dy);

    if (distancia > distMin) {
        let vx = (dx / distancia) * velAsimov;
        let vy = (dy / distancia) * velAsimov;

        // só verifica colisão se a função foi fornecida
        if (colisaoFn && colisaoFn(asimov.x + vx, asimov.y + vy + 10)) return;

        asimov.x += vx;
        asimov.y += vy;

        if (Math.abs(vx) > Math.abs(vy)) {
            if (vx > 0) asimov.anims.play("asimov_direita", true);
            else asimov.anims.play("asimov_esquerda", true);
        } else {
            if (vy > 0) asimov.anims.play("asimov_frente", true);
            else asimov.anims.play("asimov_tras", true);
        }
    } else {
        asimov.anims.stop();
    }
}

export function criarAnimacaoSophia(cena) {
    if (cena.anims.exists("sophia_esquerda")) return;
    cena.anims.create({ key: "sophia_esquerda", frames: cena.anims.generateFrameNumbers("sophia", { start: 24, end: 29 }), frameRate: 10, repeat: -1 });
    cena.anims.create({ key: "sophia_direita",  frames: cena.anims.generateFrameNumbers("sophia", { start: 16, end: 21 }), frameRate: 10, repeat: -1 });
    cena.anims.create({ key: "sophia_frente",   frames: cena.anims.generateFrameNumbers("sophia", { start: 0,  end: 7  }), frameRate: 10, repeat: -1 });
    cena.anims.create({ key: "sophia_tras",     frames: cena.anims.generateFrameNumbers("sophia", { start: 8,  end: 15 }), frameRate: 10, repeat: -1 });
}

export function criarAnimacaoAsimov(cena) {
    if (cena.anims.exists("asimov_esquerda")) return;
    cena.anims.create({ key: "asimov_esquerda", frames: cena.anims.generateFrameNumbers("asimov", { start: 21, end: 27 }), frameRate: 10, repeat: -1 });
    cena.anims.create({ key: "asimov_direita",  frames: cena.anims.generateFrameNumbers("asimov", { start: 28, end: 34 }), frameRate: 10, repeat: -1 });
    cena.anims.create({ key: "asimov_frente",   frames: cena.anims.generateFrameNumbers("asimov", { start: 7,  end: 9  }), frameRate: 10, repeat: -1 });
    cena.anims.create({ key: "asimov_tras",     frames: cena.anims.generateFrameNumbers("asimov", { start: 14, end: 16 }), frameRate: 10, repeat: -1 });
}
