import TeacherHero from "@/components/TeacherHero"
import TeacherSelector from "@/components/TeacherSelector"
import Loader from "@/components/ui/Loader/Loader"
import { Suspense } from "react"

const page = () => {
    return (
        <>
            <TeacherHero />
            <Suspense fallback={<Loader />}>
                <TeacherSelector />
            </Suspense>
        </>
    )
}
export default page