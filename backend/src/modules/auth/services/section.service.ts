import {Service} from 'typedi';
import {CourseRepository} from '../../../shared/database/providers/mongo/repositories/CourseRepository';
import {NotFoundError} from '../../../shared/errors/not-found.error';

@Service() // TypeDI service decorator
export class SectionService {
  constructor(private courseRepo: CourseRepository) {} // Injected dependency

  async deleteSection(
    versionId: string,
    moduleId: string,
    sectionId: string,
  ): Promise<void> {
    try {
      const success = await this.courseRepo.deleteSection(
        versionId,
        moduleId,
        sectionId,
      );
      if (!success) {
        throw new NotFoundError('Section deletion failed');
      }
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new Error(`Failed to delete section: ${error.message}`);
    }
  }
}
