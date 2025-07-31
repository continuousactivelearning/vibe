// Sorting handler
export const handleSort = (column: 'name' | 'enrollmentDate' | 'progress') => {
    if (sortBy === column) {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
        setSortBy(column)
        setSortOrder('asc')
    }
}

export const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage)
    }
}