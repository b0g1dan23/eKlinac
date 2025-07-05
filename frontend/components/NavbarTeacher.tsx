'use client';

// import styles from './NavbarTeacher.module.scss'
import { RxDashboard } from "react-icons/rx";
import { MdOutlineMessage } from "react-icons/md";
import { PiStudentDuotone } from "react-icons/pi";
import { GiSchoolBag } from "react-icons/gi";
import { FaRegUser } from "react-icons/fa";
import type { IconType } from "react-icons";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NavbarTeacher = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const navbarLinks: {
        title: string;
        href: string;
        Icon: IconType
    }[] = [{
        title: "Početna",
        href: "/teachers",
        Icon: RxDashboard
    }, {
        title: "Poruke",
        href: "/teachers/messages",
        Icon: MdOutlineMessage
    }, {
        title: "Učenici",
        href: "/teachers/students",
        Icon: PiStudentDuotone
    }, {
        title: "Pregled domaćih",
        href: "/teachers/homeworks",
        Icon: GiSchoolBag
    },];
    const pathname = usePathname();

    return (
        <nav className="py-[12px] border-b-[1px] border-solid border-gray-100">
            <div className="container">
                <div className='flex items-center justify-between'>
                    <ul className="flex items-center gap-[10px]">
                        {navbarLinks.map(({ title, href, Icon }, i) => (
                            // <li key={`${title}-${i}`} className={pathname === href ? `${styles.navbar__link} ${styles['navbar__link-active']}` : `${styles.navbar__link}`}>
                            <li key={`${title}-${i}`} className={`rounded-[8px] transition-all duration-300 ease-in-out border-dashed border-orange-300 border-[1px] cursor-pointer hover:bg-orange-300 hover:text-white hover:scale-105 hover:shadow-[0_0_10px_rgba(255,165,0,0.5)] active:scale-75 ${pathname === href ? 'bg-orange-300 text-white' : ''}`} >
                                {/* style={{ backgroundColor: pathname === href ? 'var(--orange-color)' : 'transparent', color: pathname === href ? 'var(--white-color)' : 'var(--black-color)' }}> */}
                                < Link href={href} className="flex items-center gap-[8px] font-semibold py-[12px] px-[8px]" ><Icon size={20} /> <span>{title}</span></Link>
                            </li>
                        ))}
                    </ul>
                    <div className='p-[8px] border-[1px] border-solid border-orange-300 rounded-[6px] cursor-pointer relative' onClick={() => setShowDropdown(prev => !prev)}>
                        <FaRegUser size={20} color='var(--black-color)' />
                        {showDropdown && <div className='absolute mt-[10px] rounded-[6px] top-[100%] right-0 text-nowrap border-[1px] border-solid border-orange-300'>
                            <ul className="flex flex-col">
                                <Link href={'/auth?logout=true'} className="py-[8px] px-[16px] transition-all duration-300 ease-in-out hover:bg-orange-300 hover:text-[var(--white-color)]">Log out</Link>
                            </ul>
                        </div>}
                    </div>
                </div>
            </div >
        </nav >
    )
}
export default NavbarTeacher