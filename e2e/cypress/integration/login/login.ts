import { Given, Then } from 'cypress-cucumber-preprocessor/steps';
import { TestClientScreen } from '../../driver/page-models';

Given('I am a registered user', () => {
  TestClientScreen.visit();
});

Then('I can log in to the test client', () => {
  TestClientScreen.clickLoginLink();
});
