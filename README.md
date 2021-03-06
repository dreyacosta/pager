# Pager
Alert notification service.

## Setup
### System requirements
- [Docker](https://www.docker.com/products/docker-desktop)

### Run tests
```sh
./bin/test.sh
```

## About the solution
### Folder structure
The domain is modeled in the `src` directory. The root of this directory contains all the bounded contexts, in this case just `pager`. Inside there is the following structure:
- **Application**: entry points to the core. Application are the use cases. They are triggered by external interfaces, web app frameworks, and so on.
- **Domain**: all the objects (data + behaviour) of the domain. AggregateRoot, entities, value objects, repository interfaces, etc.
- **Infrastructure**: implementation of repositories, external interfaces, ...

```
├── src
│   └── pager
│       ├── application
│       │   ├── AckAlert
│       │   ├── AckTimeout
│       │   ├── CreateAlert
│       │   ├── HealService
│       │   └── SendNotifications
│       ├── domain
│       └── infrastructure
```

### Only once notification
When you have commands (writes to DB like `MonitoredService`) as part of one transaction, you also save `Notifications` that will later be processed as part of the same transaction.

As a second piece, there is single, separate process that will call `SendNotifications` periodically. It will check the contents of `NotificationRepository` and process the `Notifications`. After each `Notification` has been processed, the `Notification` will be marked as processed.

Therefore, `SendNotifications` sends email, SMS, and sets an external timer.

For this to work, I used an composed key: TargetId_AlertOccurredOn. I expect an atomic consistent UPSERT by this key to the database. This way if 2 same or different alerts arrive at the same time, the last one will be the one that wins.

### Nice to have improvements
- Test data builders
- Extract new class `CreateNotifications`. `CreateAlert` and `AckTimeout` have the same code for retrieving the escalation policy, getting the next level targets, and saving notifications
- Concurrent tests. Despite the some of the concurrency problems are covered with this solution approach, it'd be nice to have some `PagerConcurrent.spec`
- CI with Travis or GitHub actions

### Additional comments
- Typescript would be a better choice. Having types and clear interfaces provides clarity about the different parts of the code. I didn't use it because I'll need a few more days to be familiared with it
- Review code consistency and simmetry. I'd like to spend a few more time reviewing the naming, that objects of the same type follow the same interface, and that tests structure is the same (setup, give, when, then)
- Tests will require extra setup if dealing with real infrastructure such as opening DB connections, cleaning DB before and after tests, and closing connections after the tests. Mocks can be used instead, but if possible prefer to use an in-memory instance of the chosen DB.