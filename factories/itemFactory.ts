import { faker } from "@faker-js/faker";

export function createNewItem () {
  const item = {
    title: faker.commerce.product(),
    url:faker.internet.url(),
    description: faker.commerce.productDescription(),
    amount: faker.datatype.number()
  };

  return item;
} 