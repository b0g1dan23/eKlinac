'use client';

import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"

const TeacherSelector = () => {
    const params = useSearchParams();
    const router = useRouter();
    const selectedTab = params.get('selected');

    return (
        <section className="py-6 border-b-[1px] border-solid border-gray-100">
            <div className="container">
                <div className="flex w-fit rounded-[8px] items-center gap-2.5 p-0.5 border-[1px] border-solid border-gray-300">
                    <p className={`py-3 px-2 rounded-[6px] cursor-pointer ${selectedTab !== 'unreviewed_homework' && selectedTab !== 'unanswered_messages' ? 'bg-orange-100 border-[1px] border-solid border-orange-300' : ''}`} onClick={() => router.push('/teachers')}>Najskorije lekcije</p>
                    <p className={`py-3 px-2 rounded-[6px] cursor-pointer ${selectedTab === 'unreviewed_homework' ? 'bg-orange-100 border-[1px] border-solid border-orange-300' : ''}`} onClick={() => router.push('/teachers?selected=unreviewed_homework')}>Neocenjeni domaći</p>
                    <p className={`py-3 px-2 rounded-[6px] cursor-pointer ${selectedTab === 'unanswered_messages' ? 'bg-orange-100 border-[1px] border-solid border-orange-300' : ''}`} onClick={() => router.push('/teachers?selected=unanswered_messages')}>Neodgovorene poruke</p>
                </div>
            </div>
        </section>
    )
}
export default TeacherSelector