import { getInterns } from '../services/internService';
import api from '../services/api';

jest.mock('../services/api');

describe('internService', () => {
  it('fetches interns with correct params', async () => {
    (api.get as jest.Mock).mockResolvedValue({ data: { content: [] } });

    await getInterns(0, 10, 'test', { university: 'XYZ' });

    expect(api.get).toHaveBeenCalledWith('/interns', {
      params: { page: 0, size: 10, search: 'test', university: 'XYZ' },
    });
  });
});