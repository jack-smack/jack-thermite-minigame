local callback = nil
local scoreTarget = 1000
function StartGame(data, cb)
    if callback then return
    else callback = cb end
    scoreTarget = data.scoreTarget
    local time = data.time
    SendNUIMessage({type="startgame", data={time=time}})
    SetNuiFocus(true, true)
end
exports('thermitematch3', StartGame)

RegisterNuiCallback('finishgame', function(data)
    SetNuiFocus(false, false)
    local score = data.score
    if callback then
        print("Thermite success: ".. score>=scoreTarget)
        callback(score>=scoreTarget)
    end

end)