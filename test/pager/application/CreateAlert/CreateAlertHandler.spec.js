const MonitoredServiceInMemoryRepository = require('../../../../src/pager/infrastructure/MonitoredServiceInMemoryRepository');
const MonitoredService = require('../../../../src/pager/domain/MonitoredService');
const AlertDTO = require('../../../../src/pager/application/CreateAlert/AlertDTO');
const CreateAlertHandler = require('../../../../src/pager/application/CreateAlert/CreateAlertHandler');
const CreateAlert = require('../../../../src/pager/application/CreateAlert/CreateAlert');

describe('CreateAlertHandler', () => {
  describe('given a monitored service in a healthy state', () => {
    const serviceId = 3;
    const monitoredServiceRepository = new MonitoredServiceInMemoryRepository();

    beforeEach(async () => {
      const monitoredService = new MonitoredService({
        serviceId,
      });
      await monitoredServiceRepository.save({ monitoredService });
    });

    describe('when CreateAlertHandler receives new alert related to the service', () => {
      it('then the monitored service becomes unhealthy', async () => {
        const alertDTO = AlertDTO.create({
          alertId: 12,
          serviceId,
          alertMessage: 'Network error',
          alertOcurredOn: Date.now(),
        });

        const createAlert = new CreateAlert({
          monitoredServiceRepository,
        });
        const handler = new CreateAlertHandler({
          createAlert,
        });
        await handler.execute({ alertDTO });

        const monitoredServiceUpdated = await monitoredServiceRepository.findById({ serviceId });
        expect(monitoredServiceUpdated.getStatus()).toEqual(MonitoredService.STATUS.UNHEALTHY);
      });
    });
  });
});
