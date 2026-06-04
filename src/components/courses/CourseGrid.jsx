import CatalogCourseCard from './CatalogCourseCard'

export default function CourseGrid({ courses, purchase }) {
  return (
    <div className="course-grid-dark">
      {courses.map((course) => (
        <CatalogCourseCard key={course.id} course={course} purchase={purchase} />
      ))}
    </div>
  )
}
