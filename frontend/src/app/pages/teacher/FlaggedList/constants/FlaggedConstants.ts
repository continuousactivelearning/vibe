export const statusOptions = ["ALL", "REPORTED", "IN_REVIEW", "RESOLVED", "DISCARDED", "CLOSED"];

export const EntityOptions = ["ALL", "VIDEO", "QUIZ", "ARTICLE", "QUESTION"];

export const getStatusColor = (status: string) => {
    switch (status) {
        case "RESOLVED":
            return "bg-green-100 text-green-800 border-green-200"
        case "IN_REVIEW":
            return "bg-yellow-100 text-yellow-800 border-yellow-200"
        case "DISCARDED":
            return "bg-red-100 text-red-800 border-red-200"
        case "REPORTED":
            return "bg-blue-100 text-blue-800 border-blue-200"
        default:
            return "bg-gray-100 text-gray-800 border-gray-200"
    }
}

export const getEntityTypeIcon = (entityType: string) => {
    switch (entityType) {
        case "VIDEO":
            return "🎥"
        case "COURSE":
            return "📚"
        case "DOCUMENT":
            return "📄"
        default:
            return "📋"
    }
}