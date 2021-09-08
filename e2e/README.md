# e2e

## Test Architecture

![Our juicy test onion](./doc/our-test-onion.png?raw=true)

### Gherkin

We write Gherkin to specificy the use cases of our system.

### Step Definitions

We write step definitions to translate the Gherkin into executable specifications by orchestrating the application drivers.

### Drivers

The application drivers are what the step definitions can call to orchestrate the application.

#### Entities

Entities represent stateful objects in our system with which our stakeholders will be familiar. The classes representing the entities in our system should not contain behaviors. The behaviors that can be performed with entities are captured by Capabilities.

#### Capabilities

Capabilities are normally carried via the UI, but sometimes we want to perform these capabilities quickly and without using the UI.

Consider the case when we are trying to test the resulting UI state of a capability that is tedious to perform in the UI. In this case we care about the business rules of the capability and the resulting UI state of those business rules, but we don't really care about the UI controls used to perform that capability (or we want to test those UI controls separately). The classes in our capabilities folders can help with this by orchestrating calls to the public API of our system the same way the UI interacts with those APIs, and we can skip the UI step.

#### Factories

Factories are what we use when we want to quickly and easily get the system into some state and we don't care about the business rules needed to get there. For example, creating a user with a verified email address. We don't want to script interactions with page models or orchestrate our capabilities to do this every time we need a user. We can use factories to call on test-specific endpoints to automatically generate this data for us.

#### Page Models

Page models encapsulate the interactions a user can have with the page. For example, we may have a `TestClientScreen` page model with a method called `.clickLoginLink()`, which will simulate a click on that link when invoked. Page models are independent. They don't need to know about entities or capabilities - they just model what the page looks like and can do.

#### Setup

Setup is where utilities like "reset the db" can go.
