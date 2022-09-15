import supertest from "supertest";
import { createNewItem } from "../factories/itemFactory";
import app from "../src/app";
import { prisma } from "../src/database"

beforeEach(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE items`
})

describe('Testa POST /items ', () => {
  const newItem = createNewItem()
  it('Deve retornar 201, se cadastrado um item no formato correto', async () => {
    const result = await supertest(app).post('/items').send(newItem);
    
    const createdItem = await prisma.items.findUnique({where: {title:newItem.title}});

    expect(result.status).toBe(201)
    expect(createdItem).not.toBeNull()

  });
  it('Deve retornar 409, ao tentar cadastrar um item que exista', async () => {
    await supertest(app).post('/items').send(newItem);
    const result = await supertest(app).post('/items').send(newItem);

    expect(result.status).toBe(409)
  });
});

describe('Testa GET /items ', () => {
  const newItem = createNewItem()
  const newItem2 = createNewItem()

  it('Deve retornar status 200 e o body no formato de Array', async () => {
    await supertest(app).post('/items').send(newItem);
    await supertest(app).post('/items').send(newItem2);

    const result = await supertest(app).get('/items').send();

    expect(result.status).toBe(200)
    expect(result.body).toBeInstanceOf(Array);
  });
});

describe('Testa GET /items/:id ', () => {
  const newItem = createNewItem()
  
  it('Deve retornar status 200 e um objeto igual a o item cadastrado', async () => {
    await supertest(app).post('/items').send(newItem);
    const intenRegistered = await supertest(app).get('/items').send();
    const id = intenRegistered.body[0].id
    const result = await supertest(app).get(`/items/${id}`).send();
    const expected = {id:`${id}`, title:newItem.title, url:newItem.url, description: newItem.description, amount:newItem.amount}
    expect(result.status).toBe(200)
    expect(result.body).toMatchObject(expected);

  });
  it('Deve retornar status 404 caso não exista um item com esse id', async () => {
    const result = await supertest(app).get('/items/2').send();
    
    expect(result.status).toBe(404)
  });
});

afterAll( async () => {
  await prisma.$disconnect()
})
