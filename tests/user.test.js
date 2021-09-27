const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/user')

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
    _id: userOneId,
    name: 'Harsh',
    email: 'harshnebhwani1@gmail.com',
    password: '1234567',
    tokens: [{
        token: jwt.sign({ _id: userOneId}, process.env.JWT_SECRET)
    }]
}

beforeEach( async () => {
    await User.deleteMany()
    await new User(userOne).save()
})

test("Should signup new user", async () => {
    const response = await request(app).post('/users').send({
        name: 'Harsh',
        email: 'harsh.nebhvani@codiste.com',
        password: '1234567'
    }).expect(201)

    // Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Assertion about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Harsh',
            email: 'harsh.nebhvani@codiste.com'
        },
        token: user.tokens[0].token
    })

    expect(user.password).not.toBe('1234567')

})

test("Should login existing user", async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    const user = await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test("Should not login nonexistent user", async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: 'wring pass'
    }).expect(400) 
})


test("Should get profile", async () => {
    await request(app)
    .get('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test("Should not get profile", async () => {
    await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})

test("Should delete account for user", async () => {
    await request(app)
    .delete('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test("Should not delete account for unauthenticated user", async () => {
    await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
})

test("Should upload avatar image", async () => {
    await request(app)
    .post('/users/me/avatar')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .attach('avatar','tests/fixtures/weather.png')
    .expect(200)

    const user = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test("Should Update user data", async () => {
    await request(app)
    .patch('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send({
        name: 'Jess'
    }).expect(200)

    const user = await User.findById(userOneId)
    expect(user.name).toEqual('Jess')
})

test("Should Not Update user data", async () => {
    await request(app)
    .patch('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send({
        location: 'Jess'
    })
    .expect(400)
})