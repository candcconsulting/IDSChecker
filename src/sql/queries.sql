"select * from ifcdynamic.ifcwall_bearing"
"select * from IFCDynamic.ifcAspect_Pset_WallCommon where ifcLoadBearing = true"
"select pe.ecinstanceid, ec_classname(pe.ecclassid, 's.c'), pm.userlabel from IFCDynamic.ifcAspect_Pset_WallCommon a join bis.physicalelement pe on a.element.id = pe.ecinstanceid join bis.physicalmaterial pm on pe.physicalmaterial.id = pm.ecinstanceid where ifcLoadBearing = true "

"SELECT ec_classname(pe.ecClassid) as entity, pe.ecInstanceId as id, 'Material' as Property, pm.userLabel as PropertyValue  from ifcdynamic.ifcAspect_Pset_WallCommon a join bis.physicalelement pe on a.element.id = pe.ecinstanceid join bis.physicalMaterial pm on pe.physicalmaterial.id = pm.ecinstanceid WHERE pm.userLabel NOT IN ('Masonry - Concrete Block', 'Concrete - Cast-in-Place Concrete', 'Stone - limestone', 'Reinforced concrete - prefab') and IFCLoadBearing = True"

"SELECT ec_classname(pe.ecClassid) as entity, pe.ecInstanceId as id, 'Material' as Property, pm.userLabel as PropertyValue  from ifcdynamic.ifcAspect_Pset_WallCommon a join bis.physicalelement pe on a.element.id = pe.ecinstanceid join bis.physicalMaterial pm on pe.physicalmaterial.id = pm.ecinstanceid WHERE pm.userLabel NOT IN ('Masonry - Concrete Block', 'Concrete - Cast-in-Place Concrete', 'Stone - limestone', 'Reinforced concrete - prefab') and IFCLOADBEARING like True"