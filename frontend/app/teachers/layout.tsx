import { ReactNode } from "react"
import NavbarTeacher from "@/components/NavbarTeacher"

const layout = ({ children }: { children: ReactNode }) => {
    return (
        <>
            <NavbarTeacher />
            <main>
                {children}
            </main>
        </>
    )
}
export default layout