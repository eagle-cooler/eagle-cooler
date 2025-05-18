import { Meta } from '../src/meta';

describe('Meta', () => {
  describe('selfIdentifyId', () => {
    it('should have the correct self identify ID', () => {
      expect(Meta.selfIdentifyId).toBe('universal');
    });
  });

  describe('item', () => {
    it('should have the required item methods', () => {
      expect(Meta.item).toHaveProperty('dirname');
      expect(Meta.item).toHaveProperty('metaextPath');
      expect(Meta.item).toHaveProperty('metaext');
      expect(Meta.item).toHaveProperty('metafilePath');
      expect(Meta.item).toHaveProperty('libraryPath');
    });
  });
});
