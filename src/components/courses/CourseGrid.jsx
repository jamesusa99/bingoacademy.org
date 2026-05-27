import CatalogCourseCard from './CatalogCourseCard'

export default function CourseGrid({ courses }) {
  return (
    <div className="course-grid-dark">
      {courses.map((course) => (
        <CatalogCourseCard key={course.id} course={course} />
      ))}
    </div>
  )
}
